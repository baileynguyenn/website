import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Phone,
  Ruler,
  TreePine,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  PRODUCTS,
  categoryName,
  zaloProductUrl,
  type Product,
  type ProductListResponse,
} from "@/lib/data";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { useTitle } from "@/hooks/useTitle";

const NOTES = [
  "Hoàn thiện dầu lau thực vật Rubio Monocoat, an toàn cho trẻ nhỏ",
  "Bảo hành 5 năm khung gỗ, bảo trì trọn đời",
  "Nhận đóng theo kích thước & màu gỗ riêng — báo giá trong 24h",
  "Giá đã bao gồm VAT, chưa bao gồm phí vận chuyển lắp đặt",
];

export default function ProductDetail() {
  const { id = "" } = useParams();
  const [active, setActive] = useState(0);

  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiGet<Product>(`/products/${id}`),
  });
  const product = query.data ?? PRODUCTS.find((p) => p.id === id);

  useEffect(() => setActive(0), [id]);
  useTitle(product ? `${product.name} | Nội Thất Minh Lâm` : "Sản phẩm | Nội Thất Minh Lâm");

  const relatedQuery = useQuery({
    queryKey: ["products", "related", product?.category],
    queryFn: () => apiGet<ProductListResponse>(`/products?category=${product?.category}`),
    enabled: Boolean(product),
  });
  const related = product
    ? (relatedQuery.data && !relatedQuery.isError
        ? relatedQuery.data.items
        : PRODUCTS.filter((p) => p.category === product.category)
      ).filter((p) => p.id !== product.id).slice(0, 3)
    : [];

  if (!product && !query.isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-32 text-center" data-testid="product-not-found">
        <p className="font-heading text-3xl text-ink">Sản phẩm không tồn tại</p>
        <p className="text-ink-soft">Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn chưa đúng.</p>
        <Link
          to="/catalog"
          data-testid="product-back-catalog"
          className="rounded-full bg-royal px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-royal-deep"
        >
          Quay lại bộ sưu tập
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid animate-pulse grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] rounded-[2rem] bg-sand" />
          <div className="space-y-5 pt-6">
            <div className="h-4 w-32 rounded bg-sand" />
            <div className="h-10 w-3/4 rounded bg-sand" />
            <div className="h-6 w-40 rounded bg-sand" />
            <div className="h-28 rounded bg-sand" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 text-xs text-ink-soft sm:text-sm" aria-label="Đường dẫn">
          <Link to="/" className="transition-colors hover:text-clay">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/catalog" className="transition-colors hover:text-clay">Bộ sưu tập</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to={`/catalog?category=${product.category}`} className="transition-colors hover:text-clay">
            {categoryName(product.category)}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand" data-testid="product-gallery">
              <img
                src={product.images[active]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.badge && (
                <span className="absolute left-5 top-5 rounded-full bg-cream/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-clay backdrop-blur">
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    data-testid={`product-thumb-${i}`}
                    aria-label={`Xem ảnh ${i + 1} của ${product.name}`}
                    className={`h-20 w-20 overflow-hidden rounded-2xl transition-[box-shadow,opacity] duration-200 ${
                      active === i ? "ring-2 ring-clay ring-offset-2 ring-offset-cream" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
              {categoryName(product.category)} · Mã {product.id.toUpperCase()}
            </p>
            <h1 className="mt-4 font-heading text-3xl leading-tight tracking-tight text-ink sm:text-4xl" data-testid="product-name">
              {product.name}
            </h1>
            <p className="mt-5 font-heading text-2xl font-semibold text-clay sm:text-3xl" data-testid="product-price">
              {product.price_display}
            </p>
            <p className="mt-6 leading-relaxed text-ink-soft" data-testid="product-description">
              {product.description}
            </p>

            <dl className="mt-8 divide-y divide-line rounded-3xl border border-line bg-card" data-testid="product-specs">
              <div className="flex items-start gap-4 px-6 py-4">
                <TreePine className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Chất liệu</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{product.wood_type}</dd>
                </div>
              </div>
              <div className="flex items-start gap-4 px-6 py-4">
                <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Kích thước (D x R x C)</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{product.dimensions}</dd>
                </div>
              </div>
            </dl>

            <ul className="mt-6 space-y-3">
              {NOTES.map((n) => (
                <li key={n} className="flex items-start gap-3 text-sm text-ink-soft">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-clay" />
                  {n}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={zaloProductUrl(product)}
                target="_blank"
                rel="noreferrer"
                data-testid="product-zalo-cta"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-clay px-7 py-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-clay-deep active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                Nhắn Zalo đặt hàng
              </a>
              <a
                href={PHONE_TEL}
                data-testid="product-call-cta"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 px-7 py-4 text-sm font-semibold text-ink transition-[border-color,color] duration-200 hover:border-clay hover:text-clay"
              >
                <Phone className="h-4 w-4" />
                Gọi {PHONE_DISPLAY}
              </a>
            </div>
            <Link
              to={`/contact?product=${product.id}`}
              data-testid="product-inquiry-link"
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-panel px-7 py-4 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ribbon"
            >
              Gửi yêu cầu tư vấn kích thước riêng
            </Link>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-panel py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="flex items-center justify-between gap-6">
              <h2 className="font-heading text-2xl tracking-tight text-ink sm:text-3xl">
                Cùng không gian {categoryName(product.category).toLowerCase()}
              </h2>
              <Link
                to={`/catalog?category=${product.category}`}
                data-testid="related-view-all"
                className="flex items-center gap-2 text-sm font-semibold text-clay"
              >
                <ArrowLeft className="hidden" />
                Xem thêm
              </Link>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="related-products">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.07} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
