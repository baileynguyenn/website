// Shared types, contact constants and static fallback catalog (used when the
// backend is unreachable so pages never render blank on the static CDN).
export const PHONE_DISPLAY = "0915 211 171";
export const PHONE_TEL = "tel:0915211171";
export const ZALO_URL = "https://zalo.me/0915211171";
export const EMAIL = "lienhe@minhlamfurniture.vn";
export const HOURS = "8:30 – 20:30 (Thứ 2 – Chủ Nhật)";
export const SHOWROOMS = [
  { city: "Hoà Bình — Phú Thọ", address: "Số 389 đường Cù Chính Lan, Phường Hoà Bình, Tỉnh Phú Thọ" },
];

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd29vZGVuJTIwZnVybml0dXJlJTIwbGl2aW5nJTIwcm9vbXxlbnwwfHx8fDE3OTAyMDczNTB8MA&ixlib=rb-4.1.0&q=85";
export const WORKSHOP_IMAGE =
  "https://images.unsplash.com/photo-1712232907812-4bd219a99a49?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHNjYW5kaW5hdmlhbiUyMGZ1cm5pdHVyZSUyMGludGVyaW9yfGVufDB8fHx8MTc5MDIwNzM1MHww&ixlib=rb-4.1.0&q=85";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  price_display: string;
  wood_type: string;
  dimensions: string;
  description: string;
  badge: string;
  featured: boolean;
  images: string[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
}

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  image: string;
  count: number;
}

export interface InquiryPayload {
  full_name: string;
  phone: string;
  email?: string;
  category_interest?: string;
  message?: string;
}

export interface Inquiry extends InquiryPayload {
  id: string;
  created_at: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: "phong-khach", name: "Phòng Khách", description: "Sofa, bàn trà, kệ tivi Hòa Phát chính hãng", image: "https://images.unsplash.com/photo-1693578616322-c8abe6c7393d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwd29vZGVuJTIwZnVybml0dXJlJTIwbGl2aW5nJTIwcm9vbXxlbnwwfHx8fDE3OTAyMDczNTB8MA&ixlib=rb-4.1.0&q=85", count: 0 },
  { slug: "phong-an", name: "Phòng Ăn", description: "Bộ bàn ăn, ghế ăn, tủ buffet cho gia đình", image: "https://images.pexels.com/photos/18447739/pexels-photo-18447739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", count: 0 },
  { slug: "phong-ngu", name: "Phòng Ngủ", description: "Giường ngủ, bàn trang điểm, tab đầu giường", image: "https://images.unsplash.com/photo-1610333684078-c89bd57f2e46?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwzfHxqYXBhbmVzZSUyMHNjYW5kaW5hdmlhbiUyMGZ1cm5pdHVyZSUyMGludGVyaW9yfGVufDB8fHx8MTc5MDIwNzM1MHww&ixlib=rb-4.1.0&q=85", count: 0 },
  { slug: "phong-lam-viec", name: "Phòng Làm Việc", description: "Bàn làm việc, giá sách, nội thất văn phòng", image: "https://images.unsplash.com/photo-1597072689227-8882273e8f6a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxqYXBhbmVzZSUyMHNjYW5kaW5hdmlhbiUyMGZ1cm5pdHVyZSUyMGludGVyaW9yfGVufDB8fHx8MTc5MDIwNzM1MHww&ixlib=rb-4.1.0&q=85", count: 0 },
  { slug: "decor-phu-kien", name: "Decor & Phụ Kiện", description: "Đèn, bình gốm, đồ trang trí tuyển chọn", image: "https://images.pexels.com/photos/8251255/pexels-photo-8251255.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", count: 0 },
  { slug: "giay-dan-tuong", name: "Giấy Dán Tường & Vật Liệu", description: "Giấy dán tường, tấm ốp lam sóng thi công trọn gói", image: "https://images.pexels.com/photos/8251293/pexels-photo-8251293.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", count: 0 },
];

const LIVING2 = "https://images.unsplash.com/photo-1772475329901-58f77a9625ab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjB3b29kZW4lMjBzb2ZhJTIwbWluaW1hbGlzdCUyMGxpdmluZyUyMHJvb218ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85";
const DINING2 = "https://images.pexels.com/photos/8113029/pexels-photo-8113029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const BED2 = "https://images.unsplash.com/photo-1638531540340-9c3d9f3c3077?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHw0fHxtaW5pbWFsaXN0JTIwYmVkcm9vbSUyMHdvb2RlbiUyMGJlZCUyMHdhcm18ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85";
const OFFICE2 = "https://images.unsplash.com/photo-1575318633968-0383e7d07ca0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHw0fHxob21lJTIwb2ZmaWNlJTIwd29vZGVuJTIwZGVzayUyMG1pbmltYWx8ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85";
const DECOR2 = "https://images.pexels.com/photos/8885824/pexels-photo-8885824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const WALL2 = "https://images.pexels.com/photos/12995673/pexels-photo-12995673.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const CHEST = "https://images.unsplash.com/photo-1544691560-fc2053d97726?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBjYWJpbmV0JTIwc2hlbGYlMjBmdXJuaXR1cmUlMjBjcmFmdHNtYW5zaGlwfGVufDB8fHx8MTc5MDIwNzQxMnww&ixlib=rb-4.1.0&q=85";

export const PRODUCTS: Product[] = [
  { id: "hp-sf301", name: "Sofa Hòa Phát 3 Chỗ SF301", category: "phong-khach", price: 18500000, price_display: "18.500.000 ₫", wood_type: "Khung gỗ tự nhiên, bọc vải linen", dimensions: "2200 x 850 x 780 mm", description: "Hàng Hòa Phát chính hãng. Sofa 3 chỗ khung gỗ chắc chắn, đệm bọc vải linen tháo rời dễ vệ sinh — đường nét hiện đại, êm ái cho phòng khách gia đình.", badge: "Bán chạy", featured: true, images: ["https://images.unsplash.com/photo-1631510390389-c1e4fb20ff31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwd29vZGVuJTIwZnVybml0dXJlJTIwbGl2aW5nJTIwcm9vbXxlbnwwfHx8fDE3OTAyMDczNTB8MA&ixlib=rb-4.1.0&q=85", LIVING2] },
  { id: "hp-sf205", name: "Sofa Hòa Phát 2 Chỗ SF205", category: "phong-khach", price: 14900000, price_display: "14.900.000 ₫", wood_type: "Khung gỗ, bọc vải bố", dimensions: "1800 x 850 x 760 mm", description: "Hàng Hòa Phát chính hãng. Sofa 2 chỗ nhỏ gọn cho căn hộ, nệm mousse đàn hồi cao, vải bố tông sáng dễ phối nội thất.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1767584394169-cb62eccfe930?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b29kZW4lMjBzb2ZhJTIwbWluaW1hbGlzdCUyMGxpdmluZyUyMHJvb218ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", LIVING2] },
  { id: "hp-gt18", name: "Ghế Thư Giãn Hòa Phát GT18", category: "phong-khach", price: 4800000, price_display: "4.800.000 ₫", wood_type: "Gỗ tần bì & mây đan", dimensions: "650 x 700 x 750 mm", description: "Hàng Hòa Phát chính hãng. Ghế thư giãn khung gỗ uốn cong, mặt ngồi đan mây thoáng mát — hợp góc đọc sách, uống trà.", badge: "Mới", featured: true, images: ["https://images.pexels.com/photos/36123562/pexels-photo-36123562.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", LIVING2] },
  { id: "hp-bt42", name: "Bàn Trà Hòa Phát BT42", category: "phong-khach", price: 6200000, price_display: "6.200.000 ₫", wood_type: "Gỗ tự nhiên phủ veneer", dimensions: "Ø800 x Cao 380 mm", description: "Hàng Hòa Phát chính hãng. Bàn trà mặt tròn vân gỗ sang trọng, chân trụ vững chãi, dễ bày trí mọi phòng khách.", badge: "", featured: true, images: ["https://images.unsplash.com/photo-1649083048770-82e8ffd80431?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxtaW5pbWFsaXN0JTIwd29vZGVuJTIwZnVybml0dXJlJTIwbGl2aW5nJTIwcm9vbXxlbnwwfHx8fDE3OTAyMDczNTB8MA&ixlib=rb-4.1.0&q=85", LIVING2] },
  { id: "hp-kc21", name: "Kệ Console Hòa Phát KC21", category: "phong-khach", price: 7900000, price_display: "7.900.000 ₫", wood_type: "Gỗ công nghiệp phủ veneer óc chó", dimensions: "1400 x 350 x 800 mm", description: "Hàng Hòa Phát chính hãng. Kệ console thanh mảnh đặt cạnh sofa hoặc hành lang, bề mặt chống trầy, dễ vệ sinh.", badge: "", featured: false, images: ["https://images.pexels.com/photos/12277020/pexels-photo-12277020.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", CHEST] },
  { id: "hp-ktv68", name: "Kệ Tivi Hòa Phát KTV68", category: "phong-khach", price: 9800000, price_display: "9.800.000 ₫", wood_type: "Gỗ công nghiệp MFC cao cấp", dimensions: "2000 x 400 x 480 mm", description: "Hàng Hòa Phát chính hãng. Kệ tivi 2 mét cánh lùa êm, ngăn giấu dây điện gọn gàng, chịu tải tốt.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1772475385327-ae6212f900aa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjB3b29kZW4lMjBzb2ZhJTIwbWluaW1hbGlzdCUyMGxpdmluZyUyMHJvb218ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", LIVING2] },
  { id: "hp-ba95", name: "Bộ Bàn Ăn Hòa Phát 6 Ghế BA95", category: "phong-an", price: 22900000, price_display: "22.900.000 ₫", wood_type: "Gỗ tự nhiên & ghế bọc nệm", dimensions: "1800 x 850 x 750 mm", description: "Hàng Hòa Phát chính hãng. Bộ bàn ăn 6 ghế mặt bàn dày bo cạnh an toàn, ghế tựa êm lưng — cho bữa cơm sum vầy.", badge: "Cao cấp", featured: true, images: ["https://images.unsplash.com/photo-1758977403865-f79e156415b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHx3YXJtJTIwd29vZCUyMGZ1cm5pdHVyZSUyMGRpbmluZyUyMGNoYWlyJTIwdGFibGV8ZW58MHx8fHwxNzkwMjA3MzUwfDA&ixlib=rb-4.1.0&q=85", DINING2] },
  { id: "hp-bg33", name: "Băng Ghế Ăn Hòa Phát BG33", category: "phong-an", price: 5400000, price_display: "5.400.000 ₫", wood_type: "Gỗ tự nhiên", dimensions: "1400 x 380 x 450 mm", description: "Hàng Hòa Phát chính hãng. Băng ghế dài gọn gàng đặt cạnh bàn ăn hoặc cuối giường, mặt ngồi ôm đường cong cơ thể.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1512972972907-6d71529c5e92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHw0fHxqYXBhbmVzZSUyMHNjYW5kaW5hdmlhbiUyMGZ1cm5pdHVyZSUyMGludGVyaW9yfGVufDB8fHx8MTc5MDIwNzM1MHww&ixlib=rb-4.1.0&q=85", DINING2] },
  { id: "hp-ga07", name: "Ghế Ăn Hòa Phát GA07", category: "phong-an", price: 2200000, price_display: "2.200.000 ₫", wood_type: "Gỗ tự nhiên", dimensions: "480 x 520 x 820 mm", description: "Hàng Hòa Phát chính hãng. Ghế ăn tựa cong ôm sống lưng, nhẹ dễ di chuyển, xếp chồng tiết kiệm diện tích.", badge: "", featured: false, images: ["https://images.pexels.com/photos/11363691/pexels-photo-11363691.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", DINING2] },
  { id: "hp-tb52", name: "Tủ Buffet Hòa Phát TB52", category: "phong-an", price: 13500000, price_display: "13.500.000 ₫", wood_type: "Gỗ công nghiệp phủ veneer", dimensions: "1600 x 450 x 800 mm", description: "Hàng Hòa Phát chính hãng. Tủ buffet 4 cánh bản lề ẩn, ngăn chứa bát đĩa rộng rãi, mặt tủ trưng bày đồ decor.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1577140917170-285929fb55b7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwzfHx3b29kZW4lMjBkaW5pbmclMjB0YWJsZSUyMGNoYWlycyUyMGludGVyaW9yfGVufDB8fHx8MTc5MDIwNzQxMnww&ixlib=rb-4.1.0&q=85", DINING2] },
  { id: "hp-gn21", name: "Giường Ngủ Hòa Phát GN21", category: "phong-ngu", price: 16500000, price_display: "16.500.000 ₫", wood_type: "Gỗ tự nhiên", dimensions: "1800 x 2000 mm (kích thước khác theo yêu cầu)", description: "Hàng Hòa Phát chính hãng. Giường đầu thấp hiện đại, thanh giằng chịu lực kép, không kêu xộc xệch theo thời gian.", badge: "", featured: true, images: ["https://images.unsplash.com/photo-1713365963723-655fa464b681?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYmVkcm9vbSUyMHdvb2RlbiUyMGJlZCUyMHdhcm18ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", BED2] },
  { id: "hp-gn30", name: "Giường Ngủ Hòa Phát GN30", category: "phong-ngu", price: 21000000, price_display: "21.000.000 ₫", wood_type: "Gỗ tự nhiên vân óc chó", dimensions: "1800 x 2000 mm", description: "Hàng Hòa Phát chính hãng. Giường vân gỗ óc chó sang trọng, đầu giường nghiêng tựa lưng đọc sách thư thái.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1625579002297-aeebbf69de89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwYmVkcm9vbSUyMHdvb2RlbiUyMGJlZCUyMHdhcm18ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", BED2] },
  { id: "hp-td05", name: "Tab Đầu Giường Hòa Phát TD05", category: "phong-ngu", price: 2900000, price_display: "2.900.000 ₫", wood_type: "Gỗ tự nhiên", dimensions: "450 x 400 x 500 mm", description: "Hàng Hòa Phát chính hãng. Tab đầu giường 1 ngăn kéo ray êm, mặt viền cao chống rơi đồ, chân trụ nhỏ gọn.", badge: "", featured: false, images: ["https://images.pexels.com/photos/10660270/pexels-photo-10660270.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", BED2] },
  { id: "hp-btd11", name: "Bàn Trang Điểm Hòa Phát BTD11", category: "phong-ngu", price: 8900000, price_display: "8.900.000 ₫", wood_type: "Gỗ công nghiệp phủ melamine", dimensions: "1200 x 450 x 780 mm", description: "Hàng Hòa Phát chính hãng. Bàn trang điểm gương tròn xoay linh hoạt, 3 ngăn kéo chia ô đựng mỹ phẩm, kèm ghế đôn.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1679494422425-844a04e11f5d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxtaW5pbWFsaXN0JTIwYmVkcm9vbSUyMHdvb2RlbiUyMGJlZCUyMHdhcm18ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", BED2] },
  { id: "hp-blv40", name: "Bàn Làm Việc Hòa Phát BLV40", category: "phong-lam-viec", price: 8600000, price_display: "8.600.000 ₫", wood_type: "Gỗ công nghiệp MFC chống trầy", dimensions: "1400 x 600 x 750 mm", description: "Hàng Hòa Phát chính hãng. Bàn làm việc mặt rộng 140cm, 2 hộc kéo tiện dụng, rãnh đi dây âm mặt bàn — chuẩn văn phòng.", badge: "Văn phòng", featured: true, images: ["https://images.unsplash.com/photo-1597072689227-8882273e8f6a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxqYXBhbmVzZSUyMHNjYW5kaW5hdmlhbiUyMGZ1cm5pdHVyZSUyMGludGVyaW9yfGVufDB8fHx8MTc5MDIwNzM1MHww&ixlib=rb-4.1.0&q=85", OFFICE2] },
  { id: "hp-blv25", name: "Bàn Làm Việc Hòa Phát BLV25", category: "phong-lam-viec", price: 6800000, price_display: "6.800.000 ₫", wood_type: "Gỗ công nghiệp MFC", dimensions: "1200 x 600 x 750 mm", description: "Hàng Hòa Phát chính hãng. Bàn làm việc chân trụ gọn nhẹ, phù hợp góc học tập, lắp ráp nhanh trong 15 phút.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1449247709967-d4461a6a6103?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxob21lJTIwb2ZmaWNlJTIwd29vZGVuJTIwZGVzayUyMG1pbmltYWx8ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", OFFICE2] },
  { id: "hp-gs09", name: "Giá Sách Hòa Phát GS09", category: "phong-lam-viec", price: 7400000, price_display: "7.400.000 ₫", wood_type: "Gỗ công nghiệp phủ veneer", dimensions: "900 x 350 x 1800 mm", description: "Hàng Hòa Phát chính hãng. Giá sách 5 tầng điều chỉnh độ cao linh hoạt, chịu tải 25kg mỗi tầng.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1576314835664-a466681d122e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHx3b29kZW4lMjBjYWJpbmV0JTIwc2hlbGYlMjBmdXJuaXR1cmUlMjBjcmFmdHNtYW5zaGlwfGVufDB8fHx8MTc5MDIwNzQxMnww&ixlib=rb-4.1.0&q=85", OFFICE2] },
  { id: "hp-db03", name: "Đèn Bàn Hòa Phát DB03", category: "phong-lam-viec", price: 1850000, price_display: "1.850.000 ₫", wood_type: "Thân gỗ & chao vải", dimensions: "280 x 280 x 450 mm", description: "Hàng Hòa Phát chính hãng. Đèn bàn thân gỗ tiện tròn, chao vải tán sáng dịu mắt, công tắc chạm 3 chế độ sáng.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1519219788971-8d9797e0928e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwyfHxob21lJTIwb2ZmaWNlJTIwd29vZGVuJTIwZGVzayUyMG1pbmltYWx8ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", OFFICE2] },
  { id: "hp-dc01", name: "Bình Gốm Trang Trí DC01", category: "decor-phu-kien", price: 1450000, price_display: "1.450.000 ₫", wood_type: "Gốm nung men tro", dimensions: "180 x 180 x 320 mm", description: "Phụ kiện tuyển chọn tại Minh Lâm. Bình gốm men tro xám be, hợp cắm hoa khô & pampas trang trí phòng khách.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1610635966562-271100e624f0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwxfHxob21lJTIwZGVjb3IlMjBjZXJhbWljJTIwdmFzZSUyMHJhdHRhbiUyMGxhbXB8ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", DECOR2] },
  { id: "hp-dc02", name: "Đèn Mây Tre Trang Trí DC02", category: "decor-phu-kien", price: 2600000, price_display: "2.600.000 ₫", wood_type: "Mây tre đan thủ công", dimensions: "Ø400 x Cao 450 mm", description: "Phụ kiện tuyển chọn tại Minh Lâm. Đèn thả mây tre đan tay, ánh sáng xuyên nan tạo vệt bóng mềm ấm cúng.", badge: "Thủ công", featured: false, images: ["https://images.unsplash.com/photo-1655151420084-27b3655d8ef7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHw0fHxob21lJTIwZGVjb3IlMjBjZXJhbWljJTIwdmFzZSUyMHJhdHRhbiUyMGxhbXB8ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", DECOR2] },
  { id: "hp-dc03", name: "Khay Mây Đan DC03", category: "decor-phu-kien", price: 950000, price_display: "950.000 ₫", wood_type: "Mây tự nhiên", dimensions: "350 x 250 x 80 mm", description: "Phụ kiện tuyển chọn tại Minh Lâm. Khay mây đan quai xách tiện bày trà, trái cây hoặc đồ trang trí bàn trà.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1746719799748-7cc75acb713f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwyfHxob21lJTIwZGVjb3IlMjBjZXJhbWljJTIwdmFzZSUyMHJhdHRhbiUyMGxhbXB8ZW58MHx8fHwxNzkwMjA3NDEyfDA&ixlib=rb-4.1.0&q=85", DECOR2] },
  { id: "hp-dc04", name: "Tủ Ngăn Kéo Trang Trí DC04", category: "decor-phu-kien", price: 12500000, price_display: "12.500.000 ₫", wood_type: "Gỗ công nghiệp phủ veneer sồi", dimensions: "1200 x 450 x 850 mm", description: "Phụ kiện tuyển chọn tại Minh Lâm. Tủ 6 ngăn kéo ray giảm chấn, mặt gỗ sáng màu, đa dụng phòng khách lẫn phòng ngủ.", badge: "Độc quyền", featured: true, images: ["https://images.unsplash.com/photo-1653971858625-9cb23d0dca80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHx3b29kZW4lMjBkaW5pbmclMjB0YWJsZSUyMGNoYWlycyUyMGludGVyaW9yfGVufDB8fHx8MTc5MDIwNzQxMnww&ixlib=rb-4.1.0&q=85", DECOR2] },
  { id: "hp-wp01", name: "Giấy Dán Tường Vân Vải WP01", category: "giay-dan-tuong", price: 390000, price_display: "390.000 ₫/m²", wood_type: "Sợi xenlulô tự nhiên", dimensions: "Khổ 0.53 x 10 m", description: "Giấy dán tường bề mặt vân vải tông sáng, thi công sạch tại nhà bởi đội ngũ Minh Lâm, thân thiện môi trường.", badge: "", featured: false, images: ["https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", WALL2] },
  { id: "hp-wp02", name: "Giấy Dán Tường Hoa Văn WP02", category: "giay-dan-tuong", price: 450000, price_display: "450.000 ₫/m²", wood_type: "Giấy dệt Hàn Quốc", dimensions: "Khổ 1.06 x 15.6 m", description: "Giấy dán hoa văn botanical tông ấm nhã nhặn, hợp làm điểm nhấn đầu giường hoặc phòng ăn.", badge: "", featured: false, images: ["https://images.unsplash.com/photo-1628070852047-dc2ea1da3ffd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwzfHx3YWxscGFwZXIlMjBpbnRlcmlvciUyMHRleHR1cmVkJTIwd2FsbHxlbnwwfHx8fDE3OTAyMDc0MTJ8MA&ixlib=rb-4.1.0&q=85", WALL2] },
  { id: "hp-op03", name: "Tấm Ốp Lam Sóng OP03", category: "giay-dan-tuong", price: 890000, price_display: "890.000 ₫/m²", wood_type: "MDF phủ veneer sồi", dimensions: "1220 x 2440 mm", description: "Tấm ốp lam sóng chạy rãnh 3D, tạo điểm nhấn vách tivi, quầy lễ tân hoặc đầu giường — nhận thi công trọn gói.", badge: "Mới", featured: false, images: [WALL2, "https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"] },
];

export interface FilterOptions {
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}

export function filterProducts(list: Product[], opts: FilterOptions): Product[] {
  let out = list;
  if (opts.category) out = out.filter((p) => p.category === opts.category);
  if (opts.featured) out = out.filter((p) => p.featured);
  if (opts.search && opts.search.trim()) {
    const q = opts.search.trim().toLowerCase();
    out = out.filter((p) =>
      `${p.name} ${p.wood_type} ${p.description}`.toLowerCase().includes(q),
    );
  }
  const sorted = [...out];
  if (opts.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (opts.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  return sorted;
}

export function categoriesWithCounts(list: Product[]): CategoryInfo[] {
  return CATEGORIES.map((c) => ({
    ...c,
    count: list.filter((p) => p.category === c.slug).length,
  }));
}

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function zaloProductUrl(product: Product): string {
  return `${ZALO_URL}?text=${encodeURIComponent(`Xin chào Minh Lâm, tôi muốn tư vấn về sản phẩm ${product.name} (Mã: ${product.id})`)}`;
}
