# PRD — Nội Thất Minh Lâm (website catalog)

## Problem statement (gốc)
Website catalog tiếng Việt cho cửa hàng nội thất Minh Lâm: tối giản, chuyên nghiệp, ảnh sản phẩm lớn, CTA liên hệ/Zalo, trang chủ (hero, danh mục, sản phẩm nổi bật, tin cậy), catalog theo danh mục (phòng khách, ngủ, ăn, làm việc, decor, giấy dán tường) với lọc/tìm kiếm/trang chi tiết, trang Giới thiệu, Liên hệ (form + Zalo), Chính sách & Điều khoản, responsive + SEO cơ bản. Không có giỏ hàng/thanh toán — mục tiêu là khám phá sản phẩm và liên hệ đặt hàng.

## Định vị thương hiệu (user xác nhận)
- Minh Lâm là đại lý Nội thất Hòa Phát đầu tiên (số 1) tại Hoà Bình; cung cấp thêm nội thất khác cho gia đình, văn phòng, cơ quan.
- Địa chỉ: Số 389 đường Cù Chính Lan, Phường Hoà Bình, Tỉnh Phú Thọ.
- Hotline/Zalo: 0915 211 171. Email: lienhe@minhlamfurniture.vn.
- Facebook: https://www.facebook.com/minh.nguyenthiminh.39545/ (không scrape được — 403).
- Theme: trắng, xanh dương (#1D5FD1), đỏ burgundy (#8E1E3F) — theo bảng hiệu thật.
- Font: Plus Jakarta Sans (heading) + Manrope (body) — hỗ trợ tiếng Việt đầy đủ.
- Logo: dấu ấn ngôi nhà (không dùng 2 chữ cái M/L), dòng phụ "Đại lý số 1 Nội thất Hòa Phát".

## Kiến trúc
- Backend FastAPI (server.py): public /api/products, /api/products/{id}, /api/categories, /api/contact; admin auth JWT cookie (bcrypt, /api/auth/login|logout|me) + Emergent Google OAuth (/api/auth/google/session, allowlist GOOGLE_ADMIN_EMAILS); admin CRUD /api/admin/products + upload /api/admin/upload (object storage qua EMERGENT_LLM_KEY, files serve công khai /api/files/{path}).
- catalog_data.py: 25 sản phẩm SKU hp-* tên Hòa Phát; seed.py idempotent (wipe + insert).
- Frontend Vite/React/TS: pages Home, Catalog (lọc+tìm+sort), ProductDetail (gallery, Zalo prefill), About, Contact (form→/api/contact), Privacy, Terms; admin /admin/login + /admin (CRUD + upload ảnh) + AuthCallback (session_id từ hash). Lenis smooth scroll, motion reveals, marquee, floating Zalo. Fallback tĩnh trong lib/data.ts khi backend offline.

## Đã triển khai
- 24/09/2026: Toàn bộ site catalog + SEO + responsive; retheme xanh/burgundy theo bảng hiệu; đổi font hỗ trợ TV; địa chỉ/SĐT thật; SKU & tên sản phẩm Hòa Phát (hp-*); admin panel email/password (admin@minhlamfurniture.vn / MinhLam@2026); upload ảnh sản phẩm qua object storage; đăng nhập Google (Emergent) cho admin với allowlist.

## Backlog / tiếp theo
- P0: Thêm email Google thật của chủ shop vào GOOGLE_ADMIN_EMAILS (backend/.env) để dùng nút Google sign-in.
- P1: Ảnh sản phẩm Hòa Phát thật (hiện đang dùng ảnh mẫu stock — MOCKED); thay bằng ảnh chụp tại showroom qua trang admin.
- P1: Trang quản trị xem danh sách yêu cầu tư vấn (collection inquiries).
- P2: Bản đồ Google Maps nhúng ở trang Liên hệ; blog/tin tức SEO; đa ảnh thật cho từng sản phẩm.
- Bỏ qua theo yêu cầu: tích hợp Claude AI (user: "ko add claude vao nua").
