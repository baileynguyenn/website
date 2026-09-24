import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, LogOut, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import { CATEGORIES, categoryName, type Product, type ProductListResponse } from "@/lib/data";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminLogout,
  adminMe,
  adminUpdateProduct,
  adminUploadImage,
  type ProductInput,
} from "@/lib/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { useTitle } from "@/hooks/useTitle";
import AdminInquiries from "./AdminInquiries";

const EMPTY: ProductInput = {
  name: "",
  category: "phong-khach",
  price: 0,
  price_display: "",
  wood_type: "",
  dimensions: "",
  description: "",
  badge: "",
  featured: false,
  images: [],
};

export default function AdminDashboard() {
  const isInquiries = useLocation().pathname === "/admin/inquiries";
  useTitle(`${isInquiries ? "Yêu cầu tư vấn" : "Quản trị sản phẩm"} | Nội Thất Minh Lâm`);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authed, setAuthed] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminMe()
      .then(() => setAuthed(true))
      .catch(() => navigate("/admin/login"));
  }, [navigate]);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiGet<ProductListResponse>("/products?sort=newest"),
    enabled: authed,
  });

  const products = useMemo(() => {
    const items = productsQuery.data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => `${p.name} ${p.id}`.toLowerCase().includes(q));
  }, [productsQuery.data, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      price_display: p.price_display,
      wood_type: p.wood_type,
      dimensions: p.dimensions,
      description: p.description,
      badge: p.badge,
      featured: p.featured,
      images: p.images,
    });
    setDialogOpen(true);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const url = await adminUploadImage(f);
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      }
      toast.success("Đã tải ảnh lên");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải ảnh lên thất bại");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminUpdateProduct(editing.id, form);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await adminCreateProduct(form);
        toast.success("Đã thêm sản phẩm mới");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Xoá "${p.name}"? Thao tác này không hoàn tác được.`)) return;
    try {
      await adminDeleteProduct(p.id);
      toast.success("Đã xoá sản phẩm");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xoá thất bại");
    }
  };

  const logout = async () => {
    await adminLogout().catch(() => undefined);
    navigate("/admin/login");
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panel">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Về trang chủ" data-testid="admin-home-link"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link
              to="/catalog"
              data-testid="admin-view-site"
              className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-royal sm:block"
            >
              Xem trang bán hàng →
            </Link>
            <button
              onClick={logout}
              data-testid="admin-logout"
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:border-clay hover:text-clay"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" data-testid="admin-dashboard">
        <nav className="mb-8 flex gap-2 border-b border-line pb-4" aria-label="Quản trị" data-testid="admin-navigation">
          {[{ to: "/admin", label: "Sản phẩm", id: "products" }, { to: "/admin/inquiries", label: "Yêu cầu tư vấn", id: "inquiries" }].map((item) => (
            <NavLink key={item.id} to={item.to} end data-testid={`admin-nav-${item.id}`} className={({ isActive }) => `rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${isActive ? "bg-royal text-white" : "text-ink-soft hover:bg-ribbon hover:text-royal"}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        {isInquiries ? <AdminInquiries /> : <>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl text-ink sm:text-3xl">Quản lý sản phẩm</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {productsQuery.data?.total ?? 0} sản phẩm trong catalog
            </p>
          </div>
          <button
            onClick={openCreate}
            data-testid="admin-add-product"
            className="flex items-center gap-2 rounded-full bg-royal px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-royal-deep"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </button>
        </div>

        <div className="relative mt-6 max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="admin-search-input"
            placeholder="Tìm theo tên hoặc mã…"
            className="h-11 rounded-full border-line bg-card pl-11 text-sm"
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-card" data-testid="admin-products-table">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-[0.15em] text-ink-soft">
                <th className="px-5 py-4 font-semibold">Sản phẩm</th>
                <th className="px-5 py-4 font-semibold">Danh mục</th>
                <th className="px-5 py-4 font-semibold">Giá</th>
                <th className="px-5 py-4 font-semibold">Nổi bật</th>
                <th className="px-5 py-4 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-panel/60" data-testid={`admin-row-${p.id}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-sand" />
                      )}
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-ink-soft">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{categoryName(p.category)}</td>
                  <td className="px-5 py-3 font-medium text-ink">{p.price_display}</td>
                  <td className="px-5 py-3">
                    {p.featured ? (
                      <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-semibold text-clay">Nổi bật</span>
                    ) : (
                      <span className="text-xs text-ink-soft">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        data-testid={`admin-edit-${p.id}`}
                        aria-label={`Sửa ${p.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors duration-200 hover:border-royal hover:text-royal"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        data-testid={`admin-delete-${p.id}`}
                        aria-label={`Xoá ${p.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors duration-200 hover:border-clay hover:text-clay"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-ink-soft">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl" data-lenis-prevent data-testid="admin-product-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-ink">
              {editing ? `Sửa: ${editing.name}` : "Thêm sản phẩm mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="mt-4 space-y-5" data-testid="admin-product-form">
            <div className="space-y-2">
              <Label htmlFor="pf-name">Tên sản phẩm *</Label>
              <Input
                id="pf-name"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="product-form-name"
                className="h-11 rounded-2xl border-line"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select value={form.category} onValueChange={(v: string) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="product-form-category" className="h-11 w-full rounded-2xl border-line">
                    <SelectValue>{(v) => categoryName(v as string)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-price">Giá (VNĐ) *</Label>
                <Input
                  id="pf-price"
                  type="number"
                  min={0}
                  required
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  data-testid="product-form-price"
                  className="h-11 rounded-2xl border-line"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-price-display">Giá hiển thị (để trống = tự định dạng)</Label>
                <Input
                  id="pf-price-display"
                  value={form.price_display}
                  onChange={(e) => setForm({ ...form, price_display: e.target.value })}
                  data-testid="product-form-price-display"
                  placeholder="VD: 390.000 ₫/m²"
                  className="h-11 rounded-2xl border-line"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-badge">Nhãn (tuỳ chọn)</Label>
                <Input
                  id="pf-badge"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  data-testid="product-form-badge"
                  placeholder="VD: Mới, Bán chạy…"
                  className="h-11 rounded-2xl border-line"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-wood">Chất liệu</Label>
                <Input
                  id="pf-wood"
                  value={form.wood_type}
                  onChange={(e) => setForm({ ...form, wood_type: e.target.value })}
                  data-testid="product-form-wood"
                  className="h-11 rounded-2xl border-line"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-dimensions">Kích thước</Label>
                <Input
                  id="pf-dimensions"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  data-testid="product-form-dimensions"
                  placeholder="D x R x C (mm)"
                  className="h-11 rounded-2xl border-line"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf-description">Mô tả</Label>
              <Textarea
                id="pf-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                data-testid="product-form-description"
                className="rounded-2xl border-line"
              />
            </div>

            <div className="space-y-3">
              <Label>Hình ảnh</Label>
              <div className="flex flex-wrap gap-3">
                {form.images.map((url, i) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-line">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                      data-testid={`product-form-remove-image-${i}`}
                      aria-label={`Xoá ảnh ${i + 1}`}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label
                  data-testid="product-form-upload"
                  className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line text-ink-soft transition-colors duration-200 hover:border-royal hover:text-royal"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  <span className="text-[10px] font-medium">Tải ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    data-testid="product-form-file-input"
                    onChange={(e) => {
                      void onFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <p className="text-xs leading-relaxed text-ink-soft" data-testid="product-image-help">Ảnh đầu tiên là ảnh đại diện. Tối đa 8MB/ảnh. Để thay ảnh mẫu: tải ảnh thật, xoá ảnh mẫu bằng nút × trên từng ảnh rồi bấm Lưu thay đổi.</p>
            </div>

            <label className="flex items-center gap-3" htmlFor="pf-featured">
              <Checkbox
                id="pf-featured"
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v === true })}
                data-testid="product-form-featured"
              />
              <span className="text-sm font-medium text-ink">Hiển thị ở mục "Sản phẩm được yêu thích" trang chủ</span>
            </label>

            <button
              type="submit"
              disabled={saving || uploading}
              data-testid="product-form-submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-royal px-7 py-3.5 text-sm font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-royal-deep disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Lưu thay đổi" : "Thêm sản phẩm"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
