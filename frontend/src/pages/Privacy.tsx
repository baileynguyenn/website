import { LegalPage, type LegalSection } from "@/components/Legal";

const SECTIONS: LegalSection[] = [
  {
    heading: "Thông tin chúng tôi thu thập",
    body: [
      "Khi bạn gửi form tư vấn, nhắn Zalo hoặc gọi hotline, chúng tôi có thể thu thập: họ tên, số điện thoại, địa chỉ email, không gian/sản phẩm bạn quan tâm và nội dung trao đổi.",
      "Website không sử dụng cookie quảng cáo và không thu thập dữ liệu thanh toán — mọi giao dịch đặt hàng đều được xác nhận trực tiếp qua Zalo hoặc điện thoại.",
    ],
  },
  {
    heading: "Mục đích sử dụng thông tin",
    body: [
      "Thông tin của bạn chỉ được dùng để: liên hệ tư vấn và báo giá; đo đạc, sản xuất và giao hàng theo đơn đặt; chăm sóc, bảo hành và bảo trì sản phẩm sau bán.",
      "Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.",
    ],
  },
  {
    heading: "Lưu trữ và bảo mật",
    body: [
      "Dữ liệu liên hệ được lưu trữ trên hệ thống nội bộ có kiểm soát truy cập, chỉ nhân viên tư vấn và kỹ thuật trực tiếp phụ trách đơn hàng của bạn mới có quyền xem.",
      "Bạn có thể yêu cầu xem, chỉnh sửa hoặc xoá thông tin cá nhân bất cứ lúc nào qua hotline 0915 211 171 hoặc email lienhe@minhlamfurniture.vn.",
    ],
  },
  {
    heading: "Trao đổi qua Zalo",
    body: [
      "Khi nhấn các nút Zalo trên website, bạn sẽ được chuyển sang ứng dụng/nền tảng Zalo. Nội dung trò chuyện tại đó tuân theo chính sách bảo mật của Zalo, ngoài phạm vi kiểm soát của website này.",
    ],
  },
  {
    heading: "Thay đổi chính sách",
    body: [
      "Chính sách bảo mật có thể được cập nhật theo thời gian. Phiên bản mới nhất luôn được đăng tại trang này kèm ngày cập nhật.",
      "Mọi thắc mắc về quyền riêng tư, xin liên hệ: lienhe@minhlamfurniture.vn.",
    ],
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Chính Sách Bảo Mật"
      updated="01/07/2026"
      intro="Chúng tôi tôn trọng và bảo vệ thông tin cá nhân của mọi khách hàng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và lưu giữ dữ liệu khi bạn sử dụng website hoặc liên hệ tư vấn."
      sections={SECTIONS}
    />
  );
}
