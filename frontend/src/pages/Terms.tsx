import { LegalPage, type LegalSection } from "@/components/Legal";

const SECTIONS: LegalSection[] = [
  {
    heading: "Giới thiệu",
    body: [
      "Website noi-that-minh-lam là kênh giới thiệu sản phẩm và tiếp nhận yêu cầu tư vấn của Nội Thất Minh Lâm. Website không phải sàn thương mại điện tử — mọi đơn hàng được xác nhận và giao dịch trực tiếp qua Zalo, điện thoại hoặc tại showroom.",
      "Bằng việc sử dụng website, bạn đồng ý với các điều khoản dưới đây.",
    ],
  },
  {
    heading: "Thông tin sản phẩm & giá",
    body: [
      "Hình ảnh, kích thước và giá niêm yết mang tính tham khảo tại thời điểm đăng tải. Vì mỗi sản phẩm là gỗ tự nhiên, vân gỗ và tông màu thực tế có thể khác nhau đôi chút — đây là đặc trưng của chất liệu thật, không phải lỗi sản phẩm.",
      "Giá cuối cùng (gồm VAT, vận chuyển, lắp đặt hoặc kích thước tuỳ chỉnh) sẽ được Minh Lâm báo chính xác qua Zalo/điện thoại trước khi bạn xác nhận đặt hàng.",
    ],
  },
  {
    heading: "Đặt hàng theo yêu cầu",
    body: [
      "Sản phẩm đóng theo kích thước hoặc chất liệu riêng cần đặt cọc 30–50% giá trị đơn. Thời gian sản xuất thông thường 15–30 ngày làm việc tuỳ độ phức tạp, sẽ được thông báo rõ trong báo giá.",
      "Đơn tuỳ chỉnh đã vào sản xuất không hỗ trợ huỷ/hoàn cọc, trừ trường hợp lỗi thuộc về Minh Lâm.",
    ],
  },
  {
    heading: "Bảo hành & bảo trì",
    body: [
      "Sản phẩm được bảo hành theo chính sách chính hãng của từng thương hiệu (Nội thất Hòa Phát và các hãng đối tác). Phiếu bảo hành đi kèm hoá đơn khi giao hàng.",
      "Bảo hành không áp dụng cho hư hỏng do va chạm mạnh, ngấm nước kéo dài, tự ý sửa chữa hoặc sử dụng sai hướng dẫn.",
    ],
  },
  {
    heading: "Sở hữu trí tuệ",
    body: [
      "Toàn bộ nội dung, hình ảnh thiết kế và tên sản phẩm trên website thuộc quyền sở hữu của Nội Thất Minh Lâm. Vui lòng không sao chép, sử dụng cho mục đích thương mại khi chưa có chấp thuận bằng văn bản.",
    ],
  },
  {
    heading: "Liên hệ",
    body: [
      "Mọi thắc mắc về điều khoản sử dụng, xin liên hệ hotline 0915 211 171, Zalo 0915 211 171 hoặc email lienhe@minhlamfurniture.vn.",
    ],
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Điều Khoản Sử Dụng"
      updated="01/07/2026"
      intro="Các điều khoản dưới đây điều chỉnh việc sử dụng website Nội Thất Minh Lâm và quy trình tư vấn, đặt hàng qua Zalo/điện thoại. Vui lòng đọc kỹ trước khi gửi yêu cầu tư vấn hoặc đặt hàng."
      sections={SECTIONS}
    />
  );
}
