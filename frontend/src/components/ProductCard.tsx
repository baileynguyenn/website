import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { categoryName, zaloProductUrl, type Product } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-24px_rgba(35,27,21,0.28)]"
    >
      <Link
        to={`/catalog/${product.id}`}
        data-testid={`product-link-${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden bg-sand"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-clay backdrop-blur">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
          {categoryName(product.category)}
        </p>
        <h3 className="font-heading text-lg leading-snug text-ink">
          <Link
            to={`/catalog/${product.id}`}
            className="transition-colors duration-200 hover:text-clay"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-ink-soft">{product.wood_type}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="font-heading text-lg font-semibold text-clay">{product.price_display}</p>
          <a
            href={zaloProductUrl(product)}
            target="_blank"
            rel="noreferrer"
            data-testid={`product-zalo-${product.id}`}
            aria-label={`Hỏi giá ${product.name} qua Zalo`}
            className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink transition-[background-color,color,border-color] duration-200 hover:border-clay hover:bg-clay hover:text-cream"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Hỏi giá
          </a>
        </div>
      </div>
    </article>
  );
}
