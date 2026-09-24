"""Regression suite for Minh Lâm backend.

Covers: public /contact + /products, /auth login/logout/me, /auth/google/session negative,
/admin/inquiries list/search/filter/pagination/update, /admin/upload + product CRUD, CORS.

Design notes:
 * Credentials & Mongo settings come exclusively from `backend/.env` via python-dotenv, no
   hardcoded fallbacks (would silently hide missing env in CI).
 * `pytest.ini` runs xdist `--dist loadscope`, which pins each class/module to one worker but
   may split classes across workers. So every class is self-contained: it creates the docs it
   needs, tears them down in its finalizer.
 * Test data is deleted directly from Mongo (no public DELETE endpoint) so the DB is clean
   even when tests fail mid-flight.
"""
from __future__ import annotations

import io
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator, Optional
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

# Load backend env for credentials + Mongo config (no defaults — fail fast)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
CORS_ORIGIN = os.environ["CORS_ORIGINS"].split(",")[0].strip()


# ------------------------------------------------------------------ fixtures
@pytest.fixture(scope="session")
def mongo_db():
    c = MongoClient(MONGO_URL)
    try:
        yield c[DB_NAME]
    finally:
        c.close()


# NOTE: Intentionally NO session-wide blanket "TEST_" purge. Every fixture below tears down
# using the EXACT ids it created — so we never risk racing xdist workers or wiping unrelated
# documents that happen to share a prefix.


def _login(backend_url: str) -> httpx.Client:
    c = httpx.Client(base_url=f"{backend_url}/api", timeout=30.0)
    r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return c


@pytest.fixture(scope="class")
def admin_client(backend_url) -> Iterator[httpx.Client]:
    c = _login(backend_url)
    try:
        yield c
    finally:
        c.close()


# ------------------------------------------------------------------ public contact
class TestContactInquiry:
    @pytest.fixture(autouse=True)
    def _tracker(self, mongo_db):
        ids: list[str] = []
        yield ids
        if ids:
            mongo_db.inquiries.delete_many({"id": {"$in": ids}})

    def test_create_inquiry_returns_new_status(self, client, _tracker):
        payload = {
            "full_name": f"TEST_Nguyen_{uuid.uuid4().hex[:6]}",
            "phone": "0912345678",
            "email": "TEST_a@example.com",
            "category_interest": "phong-khach",
            "message": "TEST_Yêu cầu tư vấn mẫu sofa",
        }
        r = client.post("/contact", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["full_name"] == payload["full_name"]
        assert data["status"] == "new"
        assert "id" in data and "_id" not in data
        _tracker.append(data["id"])

    def test_create_inquiry_min_fields(self, client, _tracker):
        r = client.post("/contact", json={"full_name": f"TEST_Min_{uuid.uuid4().hex[:6]}", "phone": "0900000001"})
        assert r.status_code == 201
        _tracker.append(r.json()["id"])

    def test_create_inquiry_validation(self, client):
        r = client.post("/contact", json={"full_name": "A", "phone": "123"})
        assert r.status_code == 422

    def test_public_cannot_list_inquiries(self, client):
        assert client.get("/admin/inquiries").status_code == 401

    def test_public_cannot_update_inquiry(self, client):
        assert client.patch("/admin/inquiries/abc", json={"status": "contacted"}).status_code == 401


# ------------------------------------------------------------------ auth
class TestAuth:
    def test_login_wrong_password(self, client):
        r = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_success_me_logout(self, backend_url):
        with httpx.Client(base_url=f"{backend_url}/api", timeout=30.0) as c:
            r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
            assert r.status_code == 200
            assert "access_token" in c.cookies
            me = c.get("/auth/me")
            assert me.status_code == 200
            assert me.json()["email"] == ADMIN_EMAIL.lower()
            c.post("/auth/logout")
            assert c.get("/auth/me").status_code == 401

    def test_google_session_invalid(self, client):
        r = client.post("/auth/google/session", json={"session_id": "invalid_xxx"})
        assert r.status_code == 401

    def test_google_allowlist_contains_owner(self):
        """Unit test — allowlist config must include the owner email (env-driven).

        NOTE: This does NOT perform a live Google OAuth consent. It only verifies the
        server-side allowlist config that gates the /auth/google/session endpoint after a
        valid provider callback.
        """
        raw = os.environ.get("GOOGLE_ADMIN_EMAILS", "")
        emails = {e.strip().lower() for e in raw.split(",") if e.strip()}
        assert "nbngoc128@gmail.com" in emails
        assert ADMIN_EMAIL.lower() in emails

    def test_google_session_denies_non_allowlisted_via_mock(self, monkeypatch):
        """In-process unit test — imports the FastAPI handler directly, monkeypatches
        `server.requests.get` and `server.db` so no live provider or Mongo is touched.

        Verifies:
          * Allowed owner (nbngoc128@gmail.com) → 200-shape response + secure cookie is set.
          * Non-allowlisted email (test@example.invalid) → HTTPException 403 and NO writes to
            google_users / user_sessions.

        This test does NOT touch the real Mongo instance or the real Emergent OAuth provider.
        The Response cookie is inspected via a real starlette.responses.Response instance.
        """
        import asyncio as _asyncio
        import sys
        from pathlib import Path as _Path
        # Make backend/ importable so `import server` resolves to the app's server.py
        _backend_dir = str(_Path(__file__).resolve().parents[1])
        if _backend_dir not in sys.path:
            sys.path.insert(0, _backend_dir)
        import server  # type: ignore
        from starlette.responses import Response as _Response

        # ---------- helper: build a mocked provider `requests.get` return ----------
        def _make_provider_response(email: str, name: str = "Owner"):
            fake = MagicMock()
            fake.raise_for_status = MagicMock(return_value=None)
            fake.json = MagicMock(return_value={
                "email": email,
                "name": name,
                "picture": "https://example.invalid/p.png",
                "session_token": f"mocked_provider_token_{uuid.uuid4().hex}",
            })
            return fake

        # ---------- Case 1: allowed owner ----------
        owner_email = "nbngoc128@gmail.com"
        assert owner_email in server.google_admin_emails(), (
            "precondition: owner email must be in the allowlist env"
        )

        # Mock provider
        def _mock_get_ok(url, headers=None, timeout=None):
            return _make_provider_response(owner_email)
        monkeypatch.setattr(server.requests, "get", _mock_get_ok)

        # Mock db.google_users + db.user_sessions with AsyncMock — avoid real Mongo writes
        mock_db = MagicMock()
        mock_db.google_users.find_one = AsyncMock(return_value=None)
        mock_db.google_users.insert_one = AsyncMock(return_value=None)
        mock_db.user_sessions.delete_many = AsyncMock(return_value=None)
        mock_db.user_sessions.insert_one = AsyncMock(return_value=None)
        monkeypatch.setattr(server, "db", mock_db)

        resp = _Response()
        payload = server.GoogleSessionRequest(session_id="mocked_owner_session_id")
        result = _asyncio.run(
            server.google_session(payload, resp)
        )
        assert result["email"] == owner_email
        # secure httponly cookie set
        set_cookie_hdrs = [v for k, v in resp.raw_headers if k.lower() == b"set-cookie"]
        joined = b"\n".join(set_cookie_hdrs).decode("latin-1").lower()
        assert "session_token=" in joined
        assert "httponly" in joined and "secure" in joined
        # DB writes did occur for the allowed owner
        mock_db.google_users.insert_one.assert_awaited()  # new user created
        mock_db.user_sessions.insert_one.assert_awaited()

        # ---------- Case 2: non-allowlisted email → 403, no DB writes, no cookie ----------
        bad_email = "test@example.invalid"
        assert bad_email not in server.google_admin_emails()

        def _mock_get_bad(url, headers=None, timeout=None):
            return _make_provider_response(bad_email)
        monkeypatch.setattr(server.requests, "get", _mock_get_bad)

        mock_db2 = MagicMock()
        mock_db2.google_users.find_one = AsyncMock(return_value=None)
        mock_db2.google_users.insert_one = AsyncMock(return_value=None)
        mock_db2.user_sessions.delete_many = AsyncMock(return_value=None)
        mock_db2.user_sessions.insert_one = AsyncMock(return_value=None)
        monkeypatch.setattr(server, "db", mock_db2)

        resp2 = _Response()
        from fastapi import HTTPException as _HTTPException
        with pytest.raises(_HTTPException) as excinfo:
            _asyncio.run(
                server.google_session(
                    server.GoogleSessionRequest(session_id="mocked_bad_session_id"),
                    resp2,
                )
            )
        assert excinfo.value.status_code == 403
        # no writes, no cookie
        mock_db2.google_users.insert_one.assert_not_awaited()
        mock_db2.user_sessions.insert_one.assert_not_awaited()
        set_cookie_hdrs2 = [v for k, v in resp2.raw_headers if k.lower() == b"set-cookie"]
        assert not set_cookie_hdrs2, f"unexpected cookie on 403: {set_cookie_hdrs2}"


# ------------------------------------------------------------------ admin inquiries
class TestAdminInquiries:
    @pytest.fixture(autouse=True)
    def _seed(self, mongo_db, admin_client, backend_url):
        # Seed 3 own inquiries used across tests in this class
        marker = f"TEST_AI_{uuid.uuid4().hex[:6]}"
        payloads = [
            {"full_name": f"{marker}_alpha", "phone": "0911111111", "email": "alpha@t.example",
             "message": "sofa gỗ óc chó"},
            {"full_name": f"{marker}_beta", "phone": "0922222222", "email": "beta@t.example",
             "message": "TEST_.*Match tủ bếp"},  # contains regex metachars → verify escaping
            {"full_name": f"{marker}_gamma", "phone": "0933333333", "email": "gamma@t.example",
             "message": "giường ngủ khách sạn"},
        ]
        # Post via public /contact so behaviour is end-to-end
        pub = httpx.Client(base_url=f"{backend_url}/api", timeout=30.0)
        created = []
        for p in payloads:
            r = pub.post("/contact", json=p)
            assert r.status_code == 201
            created.append(r.json()["id"])
        pub.close()
        self.marker = marker
        self.created = created
        yield
        mongo_db.inquiries.delete_many({"id": {"$in": created}})

    def test_list_default_shape(self, admin_client):
        r = admin_client.get("/admin/inquiries")
        assert r.status_code == 200
        data = r.json()
        for key in ("items", "total", "page", "page_size"):
            assert key in data
        assert data["page"] == 1 and data["page_size"] == 20
        for item in data["items"]:
            assert "_id" not in item and "id" in item and "status" in item

    def test_search_by_name(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"search": f"{self.marker}_alpha"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert any(i["full_name"].endswith("_alpha") for i in items)

    def test_search_by_phone(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"search": "0922222222"})
        assert r.status_code == 200
        assert any(i["phone"] == "0922222222" for i in r.json()["items"])

    def test_search_by_email(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"search": "gamma@t.example"})
        assert r.status_code == 200
        assert any(i["email"] == "gamma@t.example" for i in r.json()["items"])

    def test_search_by_message(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"search": "khách sạn"})
        assert r.status_code == 200
        assert any("khách sạn" in (i.get("message") or "") for i in r.json()["items"])

    def test_search_escapes_regex_metachars(self, admin_client):
        """`TEST_.*Match` should be searched literally — not as a regex — so it matches ONLY
        the seeded inquiry that contains that exact substring, not everything TEST_-prefixed."""
        r = admin_client.get("/admin/inquiries", params={"search": "TEST_.*Match"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) >= 1
        for i in items:
            haystack = " ".join(str(i.get(k) or "") for k in ("full_name", "phone", "email", "message"))
            assert "TEST_.*Match" in haystack, f"unexpected non-literal match: {i}"

    def test_status_and_search_combined(self, admin_client):
        # First flip one seeded inquiry to `contacted`
        target = self.created[0]
        admin_client.patch(f"/admin/inquiries/{target}", json={"status": "contacted"})
        r = admin_client.get("/admin/inquiries", params={"status": "contacted", "search": self.marker})
        assert r.status_code == 200
        data = r.json()
        assert any(i["id"] == target for i in data["items"])
        for i in data["items"]:
            assert i["status"] == "contacted"

    def test_filter_new_and_invalid_statuses(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"status": "new"})
        assert r.status_code == 200
        for i in r.json()["items"]:
            assert i["status"] == "new"
        assert admin_client.get("/admin/inquiries", params={"status": "foobar"}).status_code == 422
        assert admin_client.get("/admin/inquiries", params={"page": 0}).status_code == 422

    def test_page_size_query_param_respected(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"page_size": 2, "page": 1})
        assert r.status_code == 200
        data = r.json()
        assert data["page_size"] == 2
        assert len(data["items"]) <= 2

    def test_update_status_persists(self, admin_client):
        iid = self.created[1]
        r = admin_client.patch(f"/admin/inquiries/{iid}", json={"status": "contacted"})
        assert r.status_code == 200
        assert r.json()["status"] == "contacted"
        assert r.json()["updated_at"] is not None
        r2 = admin_client.get("/admin/inquiries", params={"search": self.marker})
        assert any(i["id"] == iid and i["status"] == "contacted" for i in r2.json()["items"])

    def test_update_invalid_and_missing(self, admin_client):
        assert admin_client.patch(
            f"/admin/inquiries/{self.created[0]}", json={"status": "bogus"}
        ).status_code == 422
        assert admin_client.patch(
            "/admin/inquiries/does-not-exist-xyz", json={"status": "closed"}
        ).status_code == 404


# ------------------------------------------------------------------ legacy / ObjectId
class TestLegacyInquiryShapes:
    """Real legacy inquiry shape: `_id` is an ObjectId AND a separate `id` UUID field exists,
    `created_at` is a naive UTC datetime, and there is no `status` field.

    (Earlier iterations invented an ObjectId-without-id shape that the app never actually
    produced; that has been removed here.)
    """

    @pytest.fixture(autouse=True)
    def _seed(self, mongo_db):
        self.oid = ObjectId()
        self.uuid_id = str(uuid.uuid4())
        legacy = {
            "_id": self.oid,
            "id": self.uuid_id,
            "full_name": f"TEST_Legacy_{uuid.uuid4().hex[:6]}",
            "phone": "0977000000",
            "email": None,
            "category_interest": None,
            "message": None,
            # naive UTC datetime (pre-tz-aware migration)
            "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
            # NOTE: no `status` field
        }
        self.full_name = legacy["full_name"]
        mongo_db.inquiries.insert_one(legacy)
        yield
        # Teardown: exact _id only, never a prefix regex
        mongo_db.inquiries.delete_one({"_id": self.oid})

    def test_legacy_returned_id_is_uuid_and_no_objectid_leaks(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"search": self.full_name})
        assert r.status_code == 200
        items = r.json()["items"]
        match = [i for i in items if i["full_name"] == self.full_name]
        assert match, items
        item = match[0]
        assert "_id" not in item
        # Returned id must be the UUID from the doc, NOT str(ObjectId)
        assert item["id"] == self.uuid_id
        assert item["id"] != str(self.oid)
        # created_at serialised as ISO UTC (either 'Z' suffix or explicit +00:00)
        assert item["created_at"].endswith("Z") or "+00:00" in item["created_at"]
        # Missing status defaults to 'new' in the response
        assert item["status"] == "new"

    def test_status_new_filter_includes_legacy_without_status(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"status": "new", "search": self.full_name})
        assert r.status_code == 200
        assert any(i["full_name"] == self.full_name for i in r.json()["items"])

    def test_patch_can_update_legacy_inquiry_status(self, admin_client):
        r = admin_client.patch(f"/admin/inquiries/{self.uuid_id}", json={"status": "contacted"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "contacted"
        assert r.json()["id"] == self.uuid_id
        r2 = admin_client.get("/admin/inquiries", params={"search": self.full_name})
        assert any(
            i["id"] == self.uuid_id and i["status"] == "contacted"
            for i in r2.json()["items"]
        )


# ------------------------------------------------------------------ CORS
#
# NOTE: We target the LOCAL uvicorn (http://localhost:8001) here, not the preview URL.
# The Kubernetes/Cloudflare ingress in front of the preview URL handles/rewrites CORS
# preflights independently (it strips `access-control-allow-origin` on responses and
# returns 400 for cross-origin OPTIONS at the edge). The FastAPI CORSMiddleware config
# is what we actually want to assert here — the ingress edge behaviour is infra, not app.
LOCAL_BACKEND = "http://localhost:8001"


class TestCORS:
    def test_preflight_allowed_origin(self):
        r = httpx.options(
            f"{LOCAL_BACKEND}/api/auth/login",
            headers={
                "Origin": CORS_ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=15.0,
        )
        assert r.status_code in (200, 204), r.text
        assert r.headers.get("access-control-allow-origin") == CORS_ORIGIN
        assert r.headers.get("access-control-allow-credentials", "").lower() == "true"

    def test_preflight_unexpected_origin_rejected(self):
        r = httpx.options(
            f"{LOCAL_BACKEND}/api/auth/login",
            headers={
                "Origin": "https://evil.example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=15.0,
        )
        # Starlette CORSMiddleware returns 400 for disallowed preflight origins.
        assert r.status_code == 400
        assert r.headers.get("access-control-allow-origin") not in ("*", "https://evil.example.com")

    def test_simple_request_from_allowed_origin_sets_cors(self):
        r = httpx.get(f"{LOCAL_BACKEND}/api/", headers={"Origin": CORS_ORIGIN}, timeout=15.0)
        assert r.status_code == 200
        assert r.headers.get("access-control-allow-origin") == CORS_ORIGIN
        assert r.headers.get("access-control-allow-credentials", "").lower() == "true"

    def test_wildcard_not_in_effect(self):
        """Regression: after tightening from `*` to explicit origin, ensure `*` is not returned."""
        r = httpx.get(f"{LOCAL_BACKEND}/api/", headers={"Origin": "https://other.example"}, timeout=15.0)
        assert r.headers.get("access-control-allow-origin") != "*"


# ------------------------------------------------------------------ admin product + upload
class TestAdminProductAndUpload:
    _product_id: Optional[str] = None

    @staticmethod
    @pytest.fixture(autouse=True, scope="class")
    def _cleanup(request, mongo_db):
        """Class-scoped teardown that deletes ONLY the exact product id captured by the
        create test — never a prefix regex. Runs even when assertions fail because it lives
        in a `yield`+finalizer style. Declared as @staticmethod so pytest does not bind it to
        an instance (which is deprecated for scope='class').
        """
        yield
        pid = TestAdminProductAndUpload._product_id
        if pid:
            mongo_db.products.delete_one({"id": pid})
            TestAdminProductAndUpload._product_id = None

    def test_upload_and_create_product(self, admin_client):
        png_bytes = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
            "890000000D49444154789C63000100000005000101"
            "0D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("test.png", io.BytesIO(png_bytes), "image/png")}
        r = admin_client.post("/admin/upload", files=files)
        assert r.status_code == 201, r.text
        upload = r.json()
        assert upload["url"].startswith("/api/files/")
        f = admin_client.get(upload["url"].replace("/api", ""))
        assert f.status_code == 200 and len(f.content) > 0
        payload = {
            "name": f"TEST_Ghế_{uuid.uuid4().hex[:6]}",
            "category": "phong-khach",
            "price": 1234000,
            "images": [upload["url"]],
        }
        r = admin_client.post("/admin/products", json=payload)
        assert r.status_code == 201, r.text
        p = r.json()
        # Capture id IMMEDIATELY so class teardown can delete it even if later assertions fail
        TestAdminProductAndUpload._product_id = p["id"]
        assert p["images"] == [upload["url"]] and p["price_display"].endswith("₫")
        pub = admin_client.get(f"/products/{p['id']}")
        assert pub.status_code == 200

    def test_delete_created_product(self, admin_client):
        pid = TestAdminProductAndUpload._product_id
        assert pid
        r = admin_client.delete(f"/admin/products/{pid}")
        assert r.status_code == 204
        assert admin_client.get(f"/products/{pid}").status_code == 404
        # Product already deleted through the API — clear id so class teardown is a no-op
        TestAdminProductAndUpload._product_id = None

    def test_admin_endpoints_require_auth(self, client):
        assert client.post("/admin/products", json={"name": "x", "category": "y", "price": 0}).status_code == 401
        assert client.post("/admin/upload", files={"file": ("a.txt", b"x", "text/plain")}).status_code == 401
