import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CATEGORIES, EMAIL, HOURS, PHONE_DISPLAY, PHONE_TEL, SHOWROOMS } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-[#3A2D23] bg-ink text-cream" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <Logo light />
            <p className="max-w-xs text-sm leading-relaxed text-cream/60">
              Đại lý Nội thất Hòa Phát tại Hoà Bình — cung cấp nội thất gia đình,
              văn phòng và công trình cơ quan, giao & lắp đặt tận nơi.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-clay-soft">
              Khám phá
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/" data-testid="footer-link-home" className="text-cream/80 transition-colors duration-200 hover:text-clay-soft">Trang chủ</Link></li>
              <li><Link to="/catalog" data-testid="footer-link-catalog" className="text-cream/80 transition-colors duration-200 hover:text-clay-soft">Bộ sưu tập</Link></li>
              <li><Link to="/about" data-testid="footer-link-about" className="text-cream/80 transition-colors duration-200 hover:text-clay-soft">Về Chúng Tôi</Link></li>
              <li><Link to="/contact" data-testid="footer-link-contact" className="text-cream/80 transition-colors duration-200 hover:text-clay-soft">Liên hệ & Showroom</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-clay-soft">
              Danh mục
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/catalog?category=${c.slug}`}
                    data-testid={`footer-category-${c.slug}`}
                    className="text-cream/80 transition-colors duration-200 hover:text-clay-soft"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-clay-soft">
              Showroom
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-cream/80">
              {SHOWROOMS.map((s) => (
                <li key={s.city} className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay-soft" />
                  <span>{s.address}</span>
                </li>
              ))}
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-clay-soft" />
                <a href={PHONE_TEL} data-testid="footer-hotline" className="transition-colors duration-200 hover:text-clay-soft">
                  Hotline & Zalo: {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-clay-soft" />
                <a href={`mailto:${EMAIL}`} data-testid="footer-email" className="transition-colors duration-200 hover:text-clay-soft">
                  {EMAIL}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-clay-soft" />
                <span>{HOURS}</span>
              </li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-16 select-none text-center font-heading text-[13vw] font-semibold leading-none tracking-tight text-cream/[0.06] lg:text-[9rem]"
        >
          MINH LÂM
        </p>

        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row">
          <p>© 2026 Nội Thất Minh Lâm — Đại lý Nội thất Hòa Phát · 389 Cù Chính Lan, Hoà Bình.</p>
          <div className="flex gap-6">
            <Link to="/privacy" data-testid="footer-link-privacy" className="transition-colors duration-200 hover:text-clay-soft">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" data-testid="footer-link-terms" className="transition-colors duration-200 hover:text-clay-soft">
              Điều khoản sử dụng
            </Link>
            <Link to="/admin/login" data-testid="footer-link-admin" className="transition-colors duration-200 hover:text-clay-soft">
              Quản trị
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
