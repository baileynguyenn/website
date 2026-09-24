import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, HeartHandshake, MessageCircle, ShieldCheck, Sofa } from "lucide-react";
import { WORKSHOP_IMAGE, ZALO_URL } from "@/lib/data";
import { EASE, MaskedLine, Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { useTitle } from "@/hooks/useTitle";

const TIMELINE = [
  { year: "Khởi đầu", title: "Showroom 389 Cù Chính Lan", desc: "Chúng tôi mở cửa tại trung tâm phường Hoà Bình, phục vụ nội thất gia đình." },
  { year: "Số 1", title: "Đại lý Hòa Phát đầu tiên", desc: "Trở thành đại lý Nội thất Hòa Phát đầu tiên tại Hoà Bình — hàng chính hãng, giá niêm yết." },
  { year: "Mở rộng", title: "Văn phòng & cơ quan", desc: "Cung cấp trọn gói nội thất cho doanh nghiệp, trường học và công trình cơ quan trong tỉnh." },
  { year: "Hôm nay", title: "Đồng hành mọi không gian", desc: "Từ phòng khách gia đình đến hội trường lớn — tư vấn, giao hàng, lắp đặt và hậu mãi tận tâm." },
];

const VALUES = [
  { icon: ShieldCheck, title: "Chính hãng 100%", desc: "Mọi sản phẩm Hòa Phát đều có tem phiếu và bảo hành hãng — nói không với hàng trôi nổi." },
  { icon: Sofa, title: "Đủ mọi không gian", desc: "Nội thất gia đình, văn phòng, công trình cơ quan — chúng tôi tư vấn trọn gói từ A đến Z." },
  { icon: HeartHandshake, title: "Tận tâm đồng hành", desc: "Giao lắp tận nơi, hậu mãi chu đáo. Một tin nhắn Zalo là đội ngũ của chúng tôi có mặt." },
];

export default function About() {
  useTitle("Về Minh Lâm | Nội Thất Gỗ Tự Nhiên");
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-xs font-semibold uppercase tracking-[0.25em] text-clay"
        >
          Về Minh Lâm
        </motion.p>
        <h1 className="mt-6 max-w-3xl font-heading text-3xl leading-[1.15] tracking-tight text-ink sm:text-4xl lg:text-[3.4rem]">
          <MaskedLine delay={0.15}>Từ showroom đầu tiên,</MaskedLine>
          <MaskedLine delay={0.3}>đến mọi <em className="text-clay">không gian</em> của bạn.</MaskedLine>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
          data-testid="about-intro"
          className="mt-8 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg"
        >
          Chúng tôi là đại lý Nội thất Hòa Phát đầu tiên tại Hoà Bình,
          đồng thời cung cấp nhiều thương hiệu nội thất tuyển chọn khác. Từ showroom
          389 Cù Chính Lan, chúng tôi đồng hành cùng hàng nghìn gia đình, văn phòng
          và cơ quan trên khắp tỉnh Phú Thọ — với một tiêu chí duy nhất: hàng thật,
          giá thật, tận tâm thật.
        </motion.p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <img
              src={WORKSHOP_IMAGE}
              alt="Không gian xưởng và showroom Minh Lâm"
              className="aspect-[16/8] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,14,0)_50%,rgba(24,18,14,0.55)_100%)]" />
            <p className="absolute bottom-6 left-6 max-w-sm font-heading text-xl leading-snug text-cream sm:bottom-10 sm:left-10 sm:text-2xl">
              "Nội thất tốt không nằm ở giá tiền — mà ở sự phù hợp với từng không gian sống và làm việc."
            </p>
          </div>
        </Reveal>
      </section>

      <Marquee />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">Hành trình</p>
            <h2 className="mt-4 font-heading text-2xl tracking-tight text-ink sm:text-3xl lg:text-4xl">
              14 năm giữ trọn nghề mộc
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="about-timeline">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-line bg-card p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-20px_rgba(35,27,21,0.25)]">
                  <p className="font-heading text-4xl font-semibold text-clay">{t.year}</p>
                  <h3 className="mt-4 font-heading text-lg text-ink">{t.title}</h3>
                  <p data-testid={`about-timeline-description-${i}`} className="mt-2 text-sm leading-relaxed text-ink-soft">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-panel py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">Giá trị cốt lõi</p>
            <h2 data-testid="about-values-heading" className="mt-4 max-w-xl font-heading text-2xl tracking-tight text-ink sm:text-3xl lg:text-4xl">
              Ba điều chúng tôi không bao giờ thỏa hiệp
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3" data-testid="about-values">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-3xl bg-cream p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ribbon">
                    <v.icon className="h-6 w-6 text-clay" />
                  </span>
                  <h3 className="mt-6 font-heading text-xl text-ink">{v.title}</h3>
                  <p data-testid={`about-value-description-${i}`} className="mt-3 text-sm leading-relaxed text-ink-soft">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-8 rounded-[2.5rem] bg-ink px-6 py-14 sm:px-12 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-heading text-2xl leading-snug tracking-tight text-cream sm:text-3xl lg:text-4xl">
                Muốn xem hàng thật, chạm tận tay?
              </h2>
              <p data-testid="about-showroom-invitation" className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70 sm:text-base">
                Mời bạn ghé showroom của chúng tôi tại 389 Cù Chính Lan, phường Hoà Bình —
                đội ngũ tư vấn luôn sẵn sàng pha một ấm trà và trò chuyện cùng bạn.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                data-testid="about-cta-contact"
                className="group flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-clay-soft active:scale-[0.98]"
              >
                Đặt lịch thăm showroom
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noreferrer"
                data-testid="about-cta-zalo"
                className="flex items-center gap-2 rounded-full border border-cream/25 px-7 py-3.5 text-sm font-semibold text-cream transition-[border-color,background-color] duration-200 hover:border-cream/60 hover:bg-cream/10"
              >
                <MessageCircle className="h-4 w-4" />
                Chat Zalo
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
