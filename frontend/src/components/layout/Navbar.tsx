import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PHONE_DISPLAY, PHONE_TEL, ZALO_URL } from "@/lib/data";

const LINKS = [
  { to: "/", label: "Trang chủ", id: "home" },
  { to: "/catalog", label: "Bộ sưu tập", id: "catalog" },
  { to: "/about", label: "Về Chúng Tôi", id: "about" },
  { to: "/contact", label: "Liên hệ & Showroom", id: "contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-cream/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Nội Thất Minh Lâm — Trang chủ">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Điều hướng chính">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.id}`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-clay" : "text-ink hover:text-clay"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={PHONE_TEL}
            data-testid="nav-hotline"
            className="hidden items-center gap-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-clay md:flex"
          >
            <Phone className="h-4 w-4 text-clay" />
            {PHONE_DISPLAY}
          </a>
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="nav-zalo-button"
            className="hidden items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-clay-deep active:scale-[0.98] sm:flex"
          >
            <MessageCircle className="h-4 w-4" />
            Tư vấn Zalo
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              data-testid="nav-menu-button"
              aria-label="Mở menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] bg-cream sm:max-w-sm" data-lenis-prevent>
              <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
              <div className="mt-10 flex flex-col gap-1">
                {LINKS.map((l) => (
                  <button
                    key={l.to}
                    data-testid={`mobile-nav-link-${l.id}`}
                    onClick={() => {
                      setOpen(false);
                      navigate(l.to);
                    }}
                    className="rounded-2xl px-4 py-4 text-left font-heading text-2xl text-ink transition-colors duration-200 hover:bg-panel hover:text-clay"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 px-4">
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="mobile-nav-zalo"
                  className="flex items-center justify-center gap-2 rounded-full bg-clay px-5 py-3.5 text-sm font-semibold text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Tư vấn qua Zalo
                </a>
                <a
                  href={PHONE_TEL}
                  data-testid="mobile-nav-hotline"
                  className="flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3.5 text-sm font-semibold text-ink"
                >
                  <Phone className="h-4 w-4 text-clay" />
                  Hotline: {PHONE_DISPLAY}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
