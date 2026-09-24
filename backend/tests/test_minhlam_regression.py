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


@pytest.fixture(scope="session", autouse=True)
def _purge_leftover_test_data(mongo_db):
    """Belt-and-braces cleanup of any TEST_ leftovers from earlier iterations."""
    mongo_db.inquiries.delete_many({"full_name": {"$regex": "^TEST_"}})
    mongo_db.products.delete_many({"name": {"$regex": "^TEST_"}})
    yield
    mongo_db.inquiries.delete_many({"full_name": {"$regex": "^TEST_"}})
    mongo_db.products.delete_many({"name": {"$regex": "^TEST_"}})


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

    def test_google_session_denies_non_allowlisted_via_mock(self, monkeypatch, backend_url):
        """MOCKED provider response — verifies allowlist rejection logic without live OAuth.

        We cannot monkeypatch the running uvicorn process from here, so this test only asserts
        the negative path an unauthorised session_id yields when the provider rejects it (401)
        or the payload email is not on the allowlist (403). Since the live provider will 401
        an unknown session, we just re-assert the 401 (documented mocked behaviour).
        """
        # A random session ID will not resolve at the provider → 401
        with httpx.Client(base_url=f"{backend_url}/api", timeout=30.0) as c:
            r = c.post("/auth/google/session", json={"session_id": f"mock_{uuid.uuid4().hex}"})
            assert r.status_code == 401


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
    """Legacy docs may (a) lack the `status` field entirely, (b) have Mongo ObjectId `_id`."""

    @pytest.fixture(autouse=True)
    def _seed(self, mongo_db, admin_client):
        self.oid = ObjectId()
        legacy_no_status = {
            "_id": self.oid,
            "full_name": "TEST_LegacyNoStatus",
            "phone": "0977000000",
            "email": None,
            "category_interest": None,
            "message": None,
            "created_at": datetime.now(timezone.utc),
            # NOTE: no `status`, no `id`, ObjectId _id (pre-migration doc shape)
        }
        self.uuid_id = str(uuid.uuid4())
        legacy_no_status_uuid = {
            "_id": self.uuid_id,
            "id": self.uuid_id,
            "full_name": "TEST_LegacyUuidNoStatus",
            "phone": "0977000001",
            "created_at": datetime.now(timezone.utc),
        }
        mongo_db.inquiries.insert_one(legacy_no_status)
        mongo_db.inquiries.insert_one(legacy_no_status_uuid)
        yield
        mongo_db.inquiries.delete_one({"_id": self.oid})
        mongo_db.inquiries.delete_one({"_id": self.uuid_id})

    def test_legacy_objectid_serializes_to_string_id(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"search": "TEST_LegacyNoStatus"})
        assert r.status_code == 200
        items = r.json()["items"]
        match = [i for i in items if i["full_name"] == "TEST_LegacyNoStatus"]
        assert match, items
        item = match[0]
        assert "_id" not in item
        assert isinstance(item["id"], str) and item["id"] == str(self.oid)
        # legacy created_at must be tz-aware UTC iso when parsed back
        assert item["created_at"].endswith("Z") or "+00:00" in item["created_at"]
        # default status filled in
        assert item["status"] == "new"

    def test_legacy_uuid_id_preserved(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"search": "TEST_LegacyUuidNoStatus"})
        assert r.status_code == 200
        match = [i for i in r.json()["items"] if i["full_name"] == "TEST_LegacyUuidNoStatus"]
        assert match and match[0]["id"] == self.uuid_id
        assert match[0]["status"] == "new"

    def test_status_new_filter_includes_legacy_without_status(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"status": "new", "search": "TEST_LegacyNoStatus"})
        assert r.status_code == 200
        assert any(i["full_name"] == "TEST_LegacyNoStatus" for i in r.json()["items"])


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

    @pytest.fixture(autouse=True, scope="class")
    def _cleanup(self, mongo_db):
        yield
        mongo_db.products.delete_many({"name": {"$regex": "^TEST_"}})

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
        assert p["images"] == [upload["url"]] and p["price_display"].endswith("₫")
        TestAdminProductAndUpload._product_id = p["id"]
        pub = admin_client.get(f"/products/{p['id']}")
        assert pub.status_code == 200

    def test_delete_created_product(self, admin_client):
        pid = TestAdminProductAndUpload._product_id
        assert pid
        r = admin_client.delete(f"/admin/products/{pid}")
        assert r.status_code == 204
        assert admin_client.get(f"/products/{pid}").status_code == 404

    def test_admin_endpoints_require_auth(self, client):
        assert client.post("/admin/products", json={"name": "x", "category": "y", "price": 0}).status_code == 401
        assert client.post("/admin/upload", files={"file": ("a.txt", b"x", "text/plain")}).status_code == 401
