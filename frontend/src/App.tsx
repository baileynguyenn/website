import { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FloatingZalo } from "@/components/FloatingZalo";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AuthCallback from "@/pages/admin/AuthCallback";

export default function App() {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  // Google OAuth returns to /admin#session_id=... — handle it before any route renders.
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/inquiries" element={<AdminDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingZalo />}
      <Toaster />
    </div>
  );
}
