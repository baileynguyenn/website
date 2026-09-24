import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sofa,
  Truck,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import {
  HERO_IMAGE,
  PRODUCTS,
  WORKSHOP_IMAGE,
  ZALO_URL,
  categoriesWithCounts,
  filterProducts,
  type CategoryInfo,
  type ProductListResponse,
} from "@/lib/data";
import { EASE, MaskedLine, Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { ProductCard } from "@/components/ProductCard";
import { useTitle } from "@/hooks/useTitle";

const STATS = [
  { value: "Số 1", label: "Đại lý Nội thất Hòa Phát tại Hoà Bình" },
  { value: "500+", label: "Khách hàng & công trình" },
  { value: "100%", label: "Hàng chính hãng, bảo hành hãng" },
];

const TRUST = [
  { icon: ShieldCheck, title: "Hàng Chính Hãng 100%", desc: "Đại lý Nội thất Hòa Phát — đầy đủ tem phiếu, bảo hành theo tiêu chuẩn hãng." },
  { icon: Sofa, title: "Đủ Mọi Không Gian", desc: "Nội thất gia đình, văn phòng làm việc và công trình cơ quan — một điểm đến duy nhất." },
  { icon: Truck, title: "Giao Hàng & Lắp Đặt Tận Nơi", desc: "Đội ngũ kỹ thuật riêng, giao lắp nhanh trong ngày tại Hoà Bình và lân cận." },
  { icon: HeartHandshake, title: "Hậu Mãi Tận Tâm", desc: "Đồng hành chăm sóc sản phẩm sau bán — một cuộc gọi là có mặt." },
];

export default function Home() {
  useTitle("Nội Thất Minh Lâm | Đồ Gỗ Tự Nhiên Tối Giản & Ấm Áp");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<CategoryInfo[]>("/categories"),
  });
  const categories =
    categoriesQuery.data && !categoriesQuery.isError
      ? categoriesQuery.data
      : categoriesWithCounts(PRODUCTS);

  const featuredQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => apiGet<ProductListResponse>("/products?featured=true"),
  });
  const featured =
    featuredQuery.data && !featuredQuery.isError
      ? featuredQuery.data.items
      : filterProducts(PRODUCTS, { featured: true });

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-20">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-1.5"
              data-testid="hero-badge"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-clay">
                Đại lý Nội thất Hòa Phát — Hoà Bình
              </span>
            </motion.div>

            <h1 className="mt-8 font-heading text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
              <MaskedLine delay={0.15}>Kiến tạo không gian</MaskedLine>
              <MaskedLine delay={0.3}>sống <em className="text-clay">thuần khiết</em></MaskedLine>
              <MaskedLine delay={0.45}>& ấm cúng.</MaskedLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
              className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg"
            >
              Nội thất Hòa Phát chính hãng cùng các thương hiệu tuyển chọn —
              trọn vẹn cho phòng khách, phòng ngủ, phòng ăn, văn phòng và công trình cơ quan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.75 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/catalog"
                data-testid="hero-cta-catalog"
                className="group flex items-center gap-2 rounded-full bg-royal px-7 py-3.5 text-sm font-semibold text-cream transition-[background-color,transform] duration-200 hover:bg-royal-deep active:scale-[0.98]"
              >
                Khám phá bộ sưu tập
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noreferrer"
                data-testid="hero-cta-zalo"
                className="flex items-center gap-2 rounded-full border border-ink/15 bg-card px-7 py-3.5 text-sm font-semibold text-ink transition-[border-color,color,transform] duration-200 hover:border-clay hover:text-clay active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                Nhắn Zalo báo giá
              </a>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-14 grid grid-cols-3 gap-6 border-t border-line pt-8"
              data-testid="hero-stats"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-heading text-2xl font-semibold text-ink sm:text-3xl">{s.value}</dd>
                  <dd className="mt-1 text-xs leading-snug text-ink-soft sm:text-sm">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <div className="relative lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/5]">
                <motion.img
                  src={HERO_IMAGE}
                  alt="Không gian phòng khách nội thất gỗ tự nhiên ấm cúng Minh Lâm"
                  style={{ y: imageY, scale: 1.15 }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,14,0)_55%,rgba(24,18,14,0.35)_100%)]" />
              </div>
              <div
                aria-hidden="true"
                className="absolute -inset-3 -z-10 translate-x-5 translate-y-5 rounded-[2.5rem] border border-line"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 1.1 }}
                className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-line bg-cream/95 px-5 py-4 shadow-[0_16px_40px_-16px_rgba(35,27,21,0.3)] backdrop-blur sm:-left-8"
                data-testid="hero-floating-badge"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel">
                  <ShieldCheck className="h-5 w-5 text-clay" />
                </span>
                <span>
                  <span className="block font-heading text-sm font-semibold text-ink">Chính hãng Hòa Phát</span>
                  <span className="block text-xs text-ink-soft">Bảo hành theo tiêu chuẩn hãng</span>
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* CATEGORIES */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">Không gian sống</p>
              <h2 className="mt-4 font-heading text-2xl tracking-tight text-ink sm:text-3xl lg:text-4xl">
                Mỗi căn phòng, một câu chuyện gỗ
              </h2>
            </div>
            <Link
              to="/catalog"
              data-testid="categories-view-all"
              className="group flex items-center gap-2 text-sm font-semibold text-clay"
            >
              Xem tất cả sản phẩm
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="category-grid">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.06} className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}>
                <Link
                  to={`/catalog?category=${c.slug}`}
                  data-testid={`category-card-${c.slug}`}
                  className={`group relative block overflow-hidden rounded-3xl ${i === 0 ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[420px]" : "aspect-[4/3]"}`}
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,14,0)_35%,rgba(24,18,14,0.72)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <h3 className="font-heading text-xl text-cream sm:text-2xl">{c.name}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-cream/75 sm:text-sm">{c.description}</p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-soft">
                        {c.count} sản phẩm
                      </p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur transition-[background-color,transform] duration-300 group-hover:bg-clay group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-panel py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">Tuyển chọn</p>
              <h2 className="mt-4 font-heading text-2xl tracking-tight text-ink sm:text-3xl lg:text-4xl">
                Sản phẩm được yêu thích
              </h2>
            </div>
            <Link
              to="/catalog"
              data-testid="featured-view-all"
              className="group flex items-center gap-2 text-sm font-semibold text-clay"
            >
              Xem toàn bộ
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="featured-products">
            {featured.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.07} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CRAFT STORY */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem]">
              <img
                src={WORKSHOP_IMAGE}
                alt="Showroom Nội thất Minh Lâm — 389 Cù Chính Lan, Hoà Bình"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 right-6 rounded-2xl bg-clay px-6 py-5 text-cream shadow-[0_20px_44px_-16px_rgba(158,90,56,0.55)]">
              <p className="font-heading text-3xl font-semibold">Số 1</p>
              <p className="text-xs uppercase tracking-[0.2em] text-cream/80">Đại lý Hòa Phát tại Hoà Bình</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">Showroom Minh Lâm</p>
            <h2 className="mt-4 font-heading text-2xl leading-snug tracking-tight text-ink sm:text-3xl lg:text-4xl">
              Đại lý Nội thất Hòa Phát đầu tiên tại Hoà Bình
            </h2>
            <p className="mt-6 leading-relaxed text-ink-soft">
              Từ showroom 389 Cù Chính Lan, Minh Lâm mang đến trọn bộ nội thất Hòa Phát
              chính hãng cùng nhiều thương hiệu tuyển chọn khác — cho căn nhà của bạn,
              văn phòng làm việc và cả những công trình cơ quan lớn.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Hàng Hòa Phát chính hãng 100%, đầy đủ tem phiếu bảo hành",
                "Đa dạng nội thất gia đình, văn phòng và công trình cơ quan",
                "Giao hàng & lắp đặt tận nơi, tư vấn miễn phí tại showroom",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-ink sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              data-testid="craft-read-more"
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink transition-[border-color,color,background-color] duration-200 hover:border-clay hover:bg-clay hover:text-cream"
            >
              Câu chuyện Minh Lâm
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-line bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8" data-testid="trust-section">
          {TRUST.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.07}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panel">
                <t.icon className="h-6 w-6 text-clay" />
              </div>
              <h3 className="mt-5 font-heading text-lg text-ink">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 sm:px-12 sm:py-20 lg:px-20" data-testid="home-cta-band">
              <div aria-hidden="true" className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-clay/20 blur-3xl" />
              <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-clay-soft/10 blur-3xl" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.25em] text-clay-soft">
                Bắt đầu hành trình của bạn
              </p>
              <h2 className="relative mt-5 max-w-2xl font-heading text-3xl leading-snug tracking-tight text-cream sm:text-4xl lg:text-5xl">
                Ghé showroom cảm nhận gỗ thật, hoặc nhắn Zalo để được báo giá trong 15 phút
              </h2>
              <div className="relative mt-10 flex flex-wrap gap-4">
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="cta-band-zalo"
                  className="flex items-center gap-2 rounded-full bg-clay px-7 py-3.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-clay-deep active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat Zalo ngay
                </a>
                <Link
                  to="/contact"
                  data-testid="cta-band-contact"
                  className="flex items-center gap-2 rounded-full border border-cream/25 px-7 py-3.5 text-sm font-semibold text-cream transition-[border-color,background-color] duration-200 hover:border-cream/60 hover:bg-cream/10"
                >
                  Đặt lịch thăm showroom
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
