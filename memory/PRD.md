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
- P0 — xác nhận từ chủ cửa hàng: thử đăng nhập Google bằng nbngoc128@gmail.com tại /admin/login; email đã được cấp quyền, chưa thực hiện Google consent thực tế.
- P1 — người dùng tự thực hiện: tải ảnh thật tại showroom qua admin → Sửa sản phẩm → Tải ảnh → xoá ảnh mẫu → Lưu thay đổi. Ảnh hiện tại vẫn là stock/ẢNH MẪU (MOCKED), không bị thay trong đợt này.
- P1 — xác nhận từ chủ cửa hàng: đối chiếu ghim Google Maps với cửa showroom 389 Cù Chính Lan; bản đồ hiện tìm theo địa chỉ, chưa có Place ID/toạ độ doanh nghiệp được xác thực.
- P2 — SEO nâng cao cho tìm kiếm tiếng Việt; blog/tin tức SEO. SEO cơ bản đã có, không tái làm các chức năng hoàn tất.
- P2 — tiếp tục đồng bộ màu trắng–xanh–burgundy khi thêm các màn hình mới; các màn hình trong đợt này giữ đúng theme.
- Bỏ qua theo yêu cầu: tích hợp Claude AI (user: "ko add claude vao nua").

## Cập nhật 2026-07 — quyền Google, yêu cầu tư vấn, bản đồ
### Yêu cầu và lựa chọn mới
- Người dùng yêu cầu cấp quyền Google, quản trị danh sách khách gửi form tư vấn, bản đồ Google Maps trên Liên hệ, thay ảnh mẫu bằng ảnh thật.
- Xác nhận: "ok, toi se tu upload anh khi dang nhap vao trang admin sau, email is nbngoc128@gmail.com".
- Đồng ý triển khai trước quản lý yêu cầu, gọi lại nhanh và các trạng thái xử lý. Không AI, không thanh toán, không tái thiết kế toàn bộ.

### Hoàn tất
- GOOGLE_ADMIN_EMAILS đã thêm nbngoc128@gmail.com, giữ admin@minhlamfurniture.vn. Không thay mật khẩu hoặc luồng Google OAuth. Danh tính/allowlist được ghi trong test_credentials.md.
- Trang /admin/inquiries dùng vỏ trang quản trị hiện có, liên kết tab Sản phẩm / Yêu cầu tư vấn.
- Hiển thị tên khách, số điện thoại với nút gọi, email, danh mục quan tâm, nội dung đầy đủ, thời gian nhận/cập nhật (giờ Việt Nam).
- Tìm kiếm tên/điện thoại/email/nội dung, lọc Mới nhận / Đã liên hệ / Đã xử lý, phân trang 20 mục, làm mới; lưu trạng thái thật vào MongoDB. Có trạng thái tải/rỗng/lỗi và báo lỗi khi cập nhật thất bại.
- API có kiểm tra admin: GET /api/admin/inquiries và PATCH /api/admin/inquiries/{id}; chặn khách chưa đăng nhập, xác thực trạng thái/phân trang, escaped regex tìm kiếm. Response không lộ _id và đặt Cache-Control: no-store.
- ContactInquiry chuyển sang model document trong backend/models/inquiry.py với chuyển đổi Mongo rõ ràng, thời gian UTC; giữ nguyên UUID của các yêu cầu cũ có ObjectId nội bộ. Yêu cầu cũ thiếu status được coi là new. Thêm index id và status/created_at.
- Google Maps iframe địa chỉ 389 Cù Chính Lan tại trang /contact, nút Chỉ đường, tải lazy, title truy cập và thông báo vị trí ghim có thể chưa chính xác. Không cần Maps API key. Iframe thật tải được, vị trí kinh doanh chính xác cần chủ shop xác nhận.
- Kiểm tra font: index.css thực tế đã có Plus Jakarta Sans và Manrope cùng subset tiếng Việt, H1 hiển thị đúng trên desktop/mobile; không cần thay font hoặc sửa CSS khi không tái hiện lỗi.
- Giữ chức năng upload ảnh hiện có; thêm hướng dẫn thay ảnh mẫu ngay trong form sản phẩm. Kiểm thử upload/lấy file/lưu sản phẩm thành công; không thay ảnh stock của catalog.
- Frontend API_BASE dùng REACT_APP_BACKEND_URL; Vite loadEnv/define chỉ expose các biến REACT_APP_ cần thiết và fail-fast khi thiếu cấu hình. URL map/directions lấy từ frontend/.env. CORS_ORIGINS backend dùng origin tường minh, không wildcard với cookie.

### Kiểm thử và giới hạn
- Báo cáo iteration_1: 21 ca backend + luồng frontend chính đạt.
- Báo cáo iteration_2: 31 ca backend; frontend phân trang, dòng cuối theo filter, lỗi API, rỗng/tải, Google iframe thật, responsive đạt.
- Báo cáo iteration_3: 31/31 pytest theo xdist; Google allowlist 200/403 được kiểm thử bằng provider/DB MOCK trong test tách biệt, không tạo phiên hoặc danh tính Google thật của chủ shop. Các API ứng dụng không mocked.
- Test hồi quy: backend/tests/test_minhlam_regression.py; dữ liệu test được xoá đúng ID, không blanket-delete theo tiền tố. Không còn sản phẩm/yêu cầu TEST_ sau kiểm thử.
- Font tiếng Việt, login email, contact → inbox → cập nhật, upload sản phẩm đều đạt; Google consent thật và ghim showroom là hai mục còn cần chủ shop kiểm tra.
- Hạ tầng preview có thể chặn preflight cross-origin; truy cập website/API cùng origin đã kiểm thử đạt. CORS middleware backend kiểm thử trực tiếp đạt. Nếu dùng frontend ở domain khác sau này, cần cấu hình cả origin/ingress.
- Build TypeScript/Vite đạt; 4 cảnh báo fast-refresh có sẵn và cảnh báo bundle size không ảnh hưởng luồng đã kiểm thử. Không tái cấu trúc ngoài model yêu cầu mới.
- Xác minh cuối sau review test: dùng asyncio.run để đóng event loop và tạo datetime UTC legacy không dùng API deprecated; chạy lại toàn bộ suite, 31/31 đạt trong 6.48 giây. Không đổi code ứng dụng sau kiểm thử giao diện thành công.

### Hướng nâng cấp (chưa triển khai)
- Ghi chú cuộc gọi theo từng yêu cầu để lưu nhu cầu, ngân sách, kết quả tư vấn.
- Lịch nhắc gọi lại để hạn chế bỏ sót khách chưa chốt đơn.
- SEO địa phương tiếng Việt/ bài viết kinh nghiệm chọn nội thất.

