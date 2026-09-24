# Auth Testing Playbook — Nội Thất Minh Lâm admin auth

Two auth methods: (1) email/password JWT httpOnly cookie `access_token` (12h); (2) Emergent-managed Google OAuth cookie `session_token` (7 days, allowlist via GOOGLE_ADMIN_EMAILS).

## Current verification scope
- Approved Google admin: nbngoc128@gmail.com (also retain existing admin@minhlamfurniture.vn).
- Check allowlist parsing and access control using disposable sessions only; do not impersonate the owner or claim a live Google sign-in was completed.
- Check browser Google redirect derives from current origin, invalid callback returns a friendly error, unauthenticated inquiries list/update are denied.
- Any disposable Google test users/sessions must be cleaned after tests and recorded in test_credentials.md if retained.
- Real Google account chooser/consent flow remains owner verification.
- Use current REACT_APP_BACKEND_URL from frontend/.env for external API tests.

## Step 1: MongoDB verification
```
mongosh
use app
db.admins.find({}).pretty()
db.google_users.find().limit(2).pretty()
db.user_sessions.find().limit(2).pretty()
```
Verify: admin `password_hash` starts with `$2b$`; unique indexes on admins.email, google_users.email, user_sessions.session_token; TTL index on user_sessions.expires_at.

## Step 2: Email/password API testing
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@minhlamfurniture.vn","password":"MinhLam@2026"}'
curl -b cookies.txt http://localhost:8001/api/auth/me
curl -b cookies.txt -X POST http://localhost:8001/api/auth/logout
curl -b cookies.txt http://localhost:8001/api/auth/me   # expect 401
```
Negative: wrong password → 401 `{"detail":"Email hoặc mật khẩu không đúng"}`.

## Step 3: Google OAuth (Emergent-managed)
Flow: /admin/login → "Đăng nhập bằng Google" → auth.emergentagent.com → redirect `{origin}/admin#session_id=...` → AuthCallback POSTs /api/auth/google/session → cookie session_token (7d) → /admin.

- Invalid session_id: `curl -X POST http://localhost:8001/api/auth/google/session -H "Content-Type: application/json" -d '{"session_id":"invalid"}'` → expect 401.
- Google account NOT in GOOGLE_ADMIN_EMAILS → 403 "chưa được cấp quyền quản trị".
- Manual session test: insert into db.user_sessions a doc {user_id, session_token: "test_session_x", expires_at: now+7d} + matching db.google_users doc with allowlisted email, then `curl -H "Cookie: session_token=test_session_x" http://localhost:8001/api/auth/me` → 200.

## Step 4: Admin CRUD + upload (works with either cookie)
```
curl -b cookies.txt -X POST http://localhost:8001/api/admin/products -H "Content-Type: application/json" -d '{"name":"Ghế Test","category":"phong-khach","price":1000000}'
curl -b cookies.txt -X PUT http://localhost:8001/api/admin/products/<id> -H "Content-Type: application/json" -d '{"name":"Ghế Test 2","category":"phong-khach","price":1200000}'
curl -b cookies.txt -F "file=@test.jpg" http://localhost:8001/api/admin/upload   # → {"path","url":"/api/files/<path>"}
curl http://localhost:8001/api/files/<path>   # public, 200 image bytes
curl -b cookies.txt -X DELETE http://localhost:8001/api/admin/products/<id>   # 204
```
Unauthenticated CRUD → 401.
