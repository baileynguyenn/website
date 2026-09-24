import { MessageCircle } from "lucide-react";
import { ZALO_URL } from "@/lib/data";

export function FloatingZalo() {
  return (
    <a
      href={ZALO_URL}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-zalo-cta"
      aria-label="Chat Zalo tư vấn ngay"
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-3"
    >
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream opacity-0 shadow-lg transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        Chat Zalo tư vấn ngay
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-[0_12px_32px_-8px_rgba(0,104,255,0.55)] transition-transform duration-300 group-hover:scale-110">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#0068FF] opacity-25" />
        <MessageCircle className="relative h-6 w-6" />
      </span>
    </a>
  );
}
