import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { apiPost } from "@/lib/api";
import {
  CATEGORIES,
  EMAIL,
  HOURS,
  PHONE_DISPLAY,
  PHONE_TEL,
  PRODUCTS,
  SHOWROOMS,
  ZALO_URL,
  type Inquiry,
  type InquiryPayload,
} from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/Reveal";
import { useTitle } from "@/hooks/useTitle";

export default function Contact() {
  useTitle("Liên Hệ & Showroom | Nội Thất Minh Lâm");
  const [params] = useSearchParams();
  const productId = params.get("product");
  const presetProduct = PRODUCTS.find((p) => p.id === productId);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(presetProduct?.category ?? "");
  const [message, setMessage] = useState(
    presetProduct ? `Tôi quan tâm sản phẩm ${presetProduct.name} (Mã: ${presetProduct.id}). ` : "",
  );

  const mutation = useMutation({
    mutationFn: (body: InquiryPayload) => apiPost<Inquiry>("/contact", body),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu tư vấn", {
        description: "Minh Lâm sẽ liên hệ với bạn trong vòng 24 giờ làm việc.",
      });
      setFullName("");
      setPhone("");
      setEmail("");
      setInterest("");
      setMessage("");
    },
    onError: () => {
      toast.error("Gửi chưa thành công", {
        description: `Bạn vui lòng nhắn Zalo ${PHONE_DISPLAY} để được hỗ trợ ngay.`,
      });
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      category_interest: interest || undefined,
      message: message.trim() || undefined,
    });
  };

  return (
    <div>
      <section className="border-b border-line bg-panel py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">Liên hệ & Showroom</p>
            <h1 className="mt-4 max-w-2xl font-heading text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Kể cho Minh Lâm nghe về không gian của bạn
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
              Gửi form bên dưới, gọi hotline hoặc nhắn Zalo — đội ngũ tư vấn phản hồi
              trong 15 phút giờ mở cửa.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <div className="space-y-4" data-testid="contact-info">
              <a
                href={PHONE_TEL}
                data-testid="contact-hotline"
                className="flex items-center gap-4 rounded-3xl border border-line bg-card p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-clay"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-panel">
                  <Phone className="h-5 w-5 text-clay" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Hotline</span>
                  <span className="mt-1 block font-heading text-lg font-semibold text-ink">{PHONE_DISPLAY}</span>
                </span>
              </a>
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noreferrer"
                data-testid="contact-zalo"
                className="flex items-center gap-4 rounded-3xl bg-[#0068FF] p-6 text-white transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Zalo — nhanh nhất</span>
                  <span className="mt-1 block font-heading text-lg font-semibold">Chat ngay: {PHONE_DISPLAY}</span>
                </span>
              </a>
              <div className="flex items-center gap-4 rounded-3xl border border-line bg-card p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-panel">
                  <Mail className="h-5 w-5 text-clay" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Email</span>
                  <a href={`mailto:${EMAIL}`} className="mt-1 block font-medium text-ink transition-colors hover:text-clay">
                    {EMAIL}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-3xl border border-line bg-card p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-panel">
                  <Clock className="h-5 w-5 text-clay" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Giờ mở cửa</span>
                  <span className="mt-1 block font-medium text-ink">{HOURS}</span>
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-line bg-ribbon p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-heading text-xl text-ink">
                <MapPin className="h-5 w-5 text-clay" />
                Hệ thống showroom
              </h2>
              <ul className="mt-5 space-y-4">
                {SHOWROOMS.map((s) => (
                  <li key={s.city} className="rounded-2xl bg-cream/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{s.city}</p>
                    <p className="mt-1 text-sm font-medium text-ink">{s.address}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-ink-soft">
                Bãi đỗ xe miễn phí · Trà & cà phê mời khách · Khu trải nghiệm vật liệu gỗ thật.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={submit}
              data-testid="contact-inquiry-form"
              className="rounded-[2rem] border border-line bg-card p-6 shadow-[0_24px_60px_-32px_rgba(35,27,21,0.25)] sm:p-10"
            >
              <h2 className="font-heading text-2xl text-ink">Gửi yêu cầu tư vấn</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Để lại thông tin, Minh Lâm gọi lại tư vấn & báo giá miễn phí.
              </p>

              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Họ và tên *</Label>
                  <Input
                    id="contact-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                    data-testid="contact-input-name"
                    placeholder="Nguyễn Văn A"
                    className="h-12 rounded-2xl border-line bg-cream"
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Số điện thoại (Zalo) *</Label>
                    <Input
                      id="contact-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      minLength={8}
                      data-testid="contact-input-phone"
                      placeholder="09xx xxx xxx"
                      className="h-12 rounded-2xl border-line bg-cream"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="contact-input-email"
                      placeholder="ban@email.com"
                      className="h-12 rounded-2xl border-line bg-cream"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sản phẩm / Không gian quan tâm</Label>
                  <Select value={interest} onValueChange={(v: string) => setInterest(v)}>
                    <SelectTrigger
                      data-testid="contact-select-interest"
                      className="h-12 w-full rounded-2xl border-line bg-cream"
                    >
                      <SelectValue>
                        {(v) => CATEGORIES.find((c) => c.slug === v)?.name ?? "Chọn không gian bạn quan tâm"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Nội dung cần tư vấn hoặc kích thước riêng</Label>
                  <Textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    data-testid="contact-input-message"
                    placeholder="Ví dụ: Tôi cần bàn ăn 6 ghế cho phòng ăn 3x4m, thích gỗ óc chó…"
                    className="rounded-2xl border-line bg-cream"
                  />
                </div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="contact-submit-button"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-royal px-7 py-4 text-sm font-semibold text-white transition-[background-color,transform,opacity] duration-200 hover:bg-royal-deep active:scale-[0.99] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {mutation.isPending ? "Đang gửi…" : "Gửi yêu cầu tư vấn"}
                </button>
                <p className="text-center text-xs text-ink-soft">
                  Cần gấp?{" "}
                  <a href={ZALO_URL} target="_blank" rel="noreferrer" className="font-semibold text-clay underline-offset-4 hover:underline">
                    Nhắn Zalo {PHONE_DISPLAY}
                  </a>{" "}
                  để được phản hồi trong 15 phút.
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
