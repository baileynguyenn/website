// Admin API helpers — session rides the httpOnly access_token cookie (credentials: "include").
export interface ProductInput {
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

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const detail =
      err && typeof err.detail === "string"
        ? err.detail
        : Array.isArray(err?.detail)
          ? err.detail.map((e: { msg?: string }) => e?.msg ?? "").filter(Boolean).join(" ")
          : null;
    throw new Error(detail ?? `Yêu cầu thất bại (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminLogin = (email: string, password: string) =>
  req<{ email: string; name: string }>("POST", "/auth/login", { email, password });
export const adminLogout = () => req<{ ok: boolean }>("POST", "/auth/logout");
export const adminMe = () => req<{ email: string }>("GET", "/auth/me");
export const adminGoogleSession = (session_id: string) =>
  req<{ email: string; name: string; picture: string }>("POST", "/auth/google/session", { session_id });

export const adminCreateProduct = (body: ProductInput) =>
  req<import("@/lib/data").Product>("POST", "/admin/products", body);
export const adminUpdateProduct = (id: string, body: ProductInput) =>
  req<import("@/lib/data").Product>("PUT", `/admin/products/${id}`, body);
export const adminDeleteProduct = (id: string) => req<void>("DELETE", `/admin/products/${id}`);

export async function adminUploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(typeof err?.detail === "string" ? err.detail : "Tải ảnh lên thất bại");
  }
  const data = await res.json();
  return data.url as string;
}
