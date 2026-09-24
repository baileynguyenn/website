import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { adminGoogleSession } from "@/lib/admin";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const sessionId = location.hash.split("session_id=")[1]?.split("&")[0];
    if (!sessionId) {
      setError("Thiếu mã phiên đăng nhập. Vui lòng thử lại.");
      return;
    }
    adminGoogleSession(sessionId)
      .then((user) => navigate("/admin", { replace: true, state: { user } }))
      .catch((err) => setError(err instanceof Error ? err.message : "Đăng nhập Google thất bại"));
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-panel px-4 text-center" data-testid="auth-callback">
      {error ? (
        <>
          <p data-testid="google-auth-error" className="max-w-sm rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </p>
          <Link to="/admin/login" data-testid="google-auth-back" className="text-sm font-semibold text-royal">
            ← Quay lại trang đăng nhập
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-royal" />
          <p className="text-sm text-ink-soft">Đang xác thực tài khoản Google…</p>
        </>
      )}
    </div>
  );
}
