import { useTitle } from "@/hooks/useTitle";
import { Reveal } from "@/components/Reveal";

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  useTitle(`${title} | Nội Thất Minh Lâm`);
  return (
    <div>
      <section className="border-b border-line bg-panel py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
              Cập nhật: {updated}
            </p>
            <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p data-testid="legal-intro" className="mt-6 leading-relaxed text-ink-soft">{intro}</p>
          </Reveal>
        </div>
      </section>
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 px-4 sm:px-6">
          {sections.map((s, i) => (
            <Reveal key={s.heading} delay={Math.min(i * 0.04, 0.2)}>
              <h2 className="font-heading text-xl text-ink sm:text-2xl">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-4 space-y-3">
                {s.body.map((p, j) => (
                  <p key={j} data-testid={`legal-section-${i}-paragraph-${j}`} className="leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
