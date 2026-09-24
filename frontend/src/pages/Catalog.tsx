import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch, Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import {
  CATEGORIES,
  PRODUCTS,
  filterProducts,
  type ProductListResponse,
} from "@/lib/data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { useTitle } from "@/hooks/useTitle";

const SORT_LABELS: Record<string, string> = {
  newest: "Mới nhất",
  "price-asc": "Giá thấp đến cao",
  "price-desc": "Giá cao đến thấp",
};

export default function Catalog() {
  useTitle("Bộ Sưu Tập | Nội Thất Minh Lâm");
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const [search, setSearch] = useState(searchInput);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (search.trim()) q.set("search", search.trim());
    if (sort) q.set("sort", sort);
    return q.toString();
  }, [category, search, sort]);

  const query = useQuery({
    queryKey: ["products", queryString],
    queryFn: () => apiGet<ProductListResponse>(`/products?${queryString}`),
  });

  const items =
    query.data && !query.isError
      ? query.data.items
      : filterProducts(PRODUCTS, { category, search, sort });

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  return (
    <div>
      <section className="border-b border-line bg-panel py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">Bộ sưu tập</p>
            <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Đồ gỗ cho mọi không gian
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
              {items.length} sản phẩm gỗ tự nhiên được tuyển chọn — từ phòng khách,
              phòng ngủ đến giấy dán tường. Nhắn Zalo để được báo giá & tư vấn kích thước riêng.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                data-testid="catalog-search-input"
                placeholder="Tìm theo tên, chất liệu gỗ…"
                className="h-12 rounded-full border-line bg-card pl-11 text-sm"
                aria-label="Tìm kiếm sản phẩm"
              />
            </div>
            <Select value={sort} onValueChange={(v: string) => setSort(v)}>
              <SelectTrigger
                data-testid="catalog-sort-select"
                className="h-12 w-full rounded-full border-line bg-card px-5 text-sm lg:w-[210px]"
                aria-label="Sắp xếp sản phẩm"
              >
                <SelectValue>{(v) => SORT_LABELS[v as string] ?? "Mới nhất"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </Reveal>

          <Reveal delay={0.15} className="mt-6 flex flex-wrap gap-2.5" data-testid="category-filters">
            <button
              onClick={() => setCategory("")}
              data-testid="filter-all"
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-[background-color,color,border-color] duration-200 ${
                category === ""
                  ? "bg-royal text-white"
                  : "border border-line bg-card text-ink hover:border-clay hover:text-clay"
              }`}
            >
              Tất cả
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCategory(c.slug)}
                data-testid={`filter-${c.slug}`}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-[background-color,color,border-color] duration-200 ${
                  category === c.slug
                    ? "bg-royal text-white"
                    : "border border-line bg-card text-ink hover:border-clay hover:text-clay"
                }`}
              >
                {c.name}
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {query.isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="catalog-loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-line bg-card">
                  <div className="aspect-[4/5] bg-sand" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/3 rounded bg-sand" />
                    <div className="h-5 w-2/3 rounded bg-sand" />
                    <div className="h-4 w-1/4 rounded bg-sand" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center" data-testid="catalog-empty">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-panel">
                <PackageSearch className="h-7 w-7 text-clay" />
              </span>
              <p className="font-heading text-xl text-ink">Không tìm thấy sản phẩm phù hợp</p>
              <p data-testid="catalog-empty-description" className="max-w-sm text-sm text-ink-soft">
                Thử từ khoá khác hoặc nhắn Zalo — chúng tôi nhận đóng theo yêu cầu riêng.
              </p>
              <button
                onClick={() => {
                  setSearchInput("");
                  setCategory("");
                }}
                data-testid="catalog-reset-filters"
                className="mt-2 rounded-full bg-royal px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-royal-deep"
              >
                Xoá bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" data-testid="catalog-grid">
              {items.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.07} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
