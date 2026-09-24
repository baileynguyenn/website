"""Regression suite for Minh Lâm backend (inquiries, auth, admin, files/upload).

Uses live backend via httpx client fixture (base_url=/api). Cleans TEST_ data.
"""
import io
import os
from typing import Optional

import httpx
import pytest


ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@minhlamfurniture.vn")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "MinhLam@2026")


@pytest.fixture(scope="module")
def admin_client(backend_url):
    """Authenticated httpx client (email/password login cookie)."""
    c = httpx.Client(base_url=f"{backend_url}/api", timeout=30.0)
    r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    yield c
    c.close()


@pytest.fixture(scope="module")
def created_inquiry_ids():
    ids: list[str] = []
    yield ids
    # cleanup happens in explicit test at end (Mongo direct wouldn't help without helper)


# ---------------- Public: contact / inquiries ----------------

class TestContactInquiry:
    def test_create_inquiry_returns_new_status(self, client, created_inquiry_ids):
        payload = {
            "full_name": "TEST_Nguyen Van A",
            "phone": "0912345678",
            "email": "TEST_a@example.com",
            "category_interest": "phong-khach",
            "message": "TEST_Yêu cầu tư vấn mẫu sofa",
        }
        r = client.post("/contact", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["full_name"] == payload["full_name"]
        assert data["phone"] == payload["phone"]
        assert data["status"] == "new"
        assert "id" in data
        assert "_id" not in data
        created_inquiry_ids.append(data["id"])

    def test_create_inquiry_min_fields(self, client, created_inquiry_ids):
        r = client.post("/contact", json={"full_name": "TEST_B", "phone": "0900000001"})
        assert r.status_code == 201
        created_inquiry_ids.append(r.json()["id"])

    def test_create_inquiry_validation(self, client):
        r = client.post("/contact", json={"full_name": "A", "phone": "123"})
        assert r.status_code == 422

    def test_public_cannot_list_inquiries(self, client):
        r = client.get("/admin/inquiries")
        assert r.status_code == 401

    def test_public_cannot_update_inquiry(self, client):
        r = client.patch("/admin/inquiries/abc", json={"status": "contacted"})
        assert r.status_code == 401


# ---------------- Auth ----------------

class TestAuth:
    def test_login_wrong_password(self, client):
        r = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_success_and_me(self, backend_url):
        with httpx.Client(base_url=f"{backend_url}/api", timeout=30.0) as c:
            r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
            assert r.status_code == 200
            assert "access_token" in c.cookies
            me = c.get("/auth/me")
            assert me.status_code == 200
            assert me.json()["email"] == ADMIN_EMAIL.lower()

    def test_logout_invalidates_session(self, backend_url):
        with httpx.Client(base_url=f"{backend_url}/api", timeout=30.0) as c:
            c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
            c.post("/auth/logout")
            r = c.get("/auth/me")
            assert r.status_code == 401

    def test_google_session_invalid(self, client):
        r = client.post("/auth/google/session", json={"session_id": "invalid_xxx"})
        assert r.status_code == 401


# ---------------- Admin inquiries ----------------

class TestAdminInquiries:
    def test_list_default(self, admin_client, created_inquiry_ids):
        r = admin_client.get("/admin/inquiries")
        assert r.status_code == 200
        data = r.json()
        for key in ("items", "total", "page", "page_size"):
            assert key in data
        assert data["page"] == 1
        assert data["page_size"] == 20
        ids = [item["id"] for item in data["items"]]
        # created ones should appear (latest-first, so within first page ideally)
        # not strictly required if many exist; ensure at least one is present overall via search
        for item in data["items"]:
            assert "_id" not in item
            assert "status" in item

    def test_search_by_name(self, admin_client, created_inquiry_ids):
        r = admin_client.get("/admin/inquiries", params={"search": "TEST_Nguyen Van A"})
        assert r.status_code == 200
        data = r.json()
        assert data["total"] >= 1
        assert any("TEST_Nguyen Van A" == i["full_name"] for i in data["items"])

    def test_filter_new_status(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"status": "new"})
        assert r.status_code == 200
        for i in r.json()["items"]:
            assert i["status"] == "new"

    def test_invalid_status_422(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"status": "foobar"})
        assert r.status_code == 422

    def test_invalid_page_422(self, admin_client):
        r = admin_client.get("/admin/inquiries", params={"page": 0})
        assert r.status_code == 422

    def test_update_status_persists(self, admin_client, created_inquiry_ids):
        assert created_inquiry_ids, "need created inquiry"
        iid = created_inquiry_ids[0]
        r = admin_client.patch(f"/admin/inquiries/{iid}", json={"status": "contacted"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "contacted"
        assert body["updated_at"] is not None
        # Verify persistence via list search
        r2 = admin_client.get("/admin/inquiries", params={"search": "TEST_Nguyen Van A"})
        match = [i for i in r2.json()["items"] if i["id"] == iid]
        assert match and match[0]["status"] == "contacted"

    def test_update_status_invalid(self, admin_client, created_inquiry_ids):
        iid = created_inquiry_ids[0]
        r = admin_client.patch(f"/admin/inquiries/{iid}", json={"status": "bogus"})
        assert r.status_code == 422

    def test_update_missing_404(self, admin_client):
        r = admin_client.patch("/admin/inquiries/does-not-exist-xyz", json={"status": "closed"})
        assert r.status_code == 404


# ---------------- Admin products + upload (regression) ----------------

class TestAdminProductAndUpload:
    _product_id: Optional[str] = None

    def test_upload_and_create_product(self, admin_client):
        # 1x1 png
        png_bytes = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
            "890000000D49444154789C63000100000005000101"
            "0D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("test.png", io.BytesIO(png_bytes), "image/png")}
        r = admin_client.post("/admin/upload", files=files)
        assert r.status_code == 201, r.text
        upload = r.json()
        assert "path" in upload and upload["url"].startswith("/api/files/")

        # Fetch file back
        f = admin_client.get(upload["url"].replace("/api", ""))
        assert f.status_code == 200
        assert len(f.content) > 0

        # Create product
        payload = {
            "name": "TEST_Ghế Regression",
            "category": "phong-khach",
            "price": 1234000,
            "images": [upload["url"]],
        }
        r = admin_client.post("/admin/products", json=payload)
        assert r.status_code == 201, r.text
        p = r.json()
        assert p["images"] == [upload["url"]]
        assert p["price_display"].endswith("₫")
        TestAdminProductAndUpload._product_id = p["id"]

        # Verify visible in public detail
        pub = admin_client.get(f"/products/{p['id']}")
        assert pub.status_code == 200
        assert pub.json()["images"] == [upload["url"]]

    def test_delete_created_product(self, admin_client):
        pid = TestAdminProductAndUpload._product_id
        assert pid
        r = admin_client.delete(f"/admin/products/{pid}")
        assert r.status_code == 204
        r2 = admin_client.get(f"/products/{pid}")
        assert r2.status_code == 404

    def test_admin_endpoints_require_auth(self, client):
        r = client.post("/admin/products", json={"name": "x", "category": "y", "price": 0})
        assert r.status_code == 401
        r = client.post("/admin/upload", files={"file": ("a.txt", b"x", "text/plain")})
        assert r.status_code == 401


# ---------------- Cleanup (at end) ----------------

def test_cleanup_test_inquiries(admin_client, created_inquiry_ids):
    """Mark test inquiries closed (no delete endpoint) and log."""
    for iid in created_inquiry_ids:
        admin_client.patch(f"/admin/inquiries/{iid}", json={"status": "closed"})
    # Not deleting since no DELETE endpoint; TEST_ prefix identifies them.
    assert True
