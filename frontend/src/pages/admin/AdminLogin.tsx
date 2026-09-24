import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, LogIn } from "lucide-react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { adminLogin } from "@/lib/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useTitle } from "@/hooks/useTitle";

export default function AdminLogin() {
  useTitle("Đăng nhập quản trị | Nội Thất Minh Lâm");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-panel px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-card p-8 shadow-[0_24px_60px_-32px_rgba(22,33,60,0.3)] sm:p-10">
        <Logo />
        <h1 className="mt-8 flex items-center gap-2 font-heading text-2xl text-ink">
          <Lock className="h-5 w-5 text-royal" />
          Đăng nhập quản trị
        </h1>
        <p data-testid="admin-login-description" className="mt-2 text-sm text-ink-soft">
          Khu vực dành cho quản trị viên của chúng tôi — quản lý sản phẩm & hình ảnh.
        </p>

        <form onSubmit={submit} data-testid="admin-login-form" className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="admin-input-email"
              placeholder="admin@minhlamfurniture.vn"
              className="h-12 rounded-2xl border-line bg-cream"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Mật khẩu</Label>
            <Input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="admin-input-password"
              placeholder="••••••••"
              className="h-12 rounded-2xl border-line bg-cream"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p data-testid="admin-login-error" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-royal px-7 py-4 text-sm font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-royal-deep disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>

          <div className="flex items-center gap-3 pt-1">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-soft">hoặc</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            onClick={loginWithGoogle}
            data-testid="admin-google-login"
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-cream px-7 py-4 text-sm font-semibold text-ink transition-[border-color,background-color] duration-200 hover:border-royal hover:bg-panel"
          >
            <SiGoogle className="h-4 w-4" color="#1D5FD1" />
            Đăng nhập bằng Google
          </button>
        </form>

        <Link to="/" data-testid="admin-login-back" className="mt-6 block text-center text-xs text-ink-soft transition-colors hover:text-royal">
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
