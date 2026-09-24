const ITEMS = [
  "Đại Lý Hòa Phát Chính Hãng",
  "Nội Thất Gia Đình",
  "Nội Thất Văn Phòng",
  "Công Trình Cơ Quan",
  "Giao & Lắp Đặt Tận Nơi",
];

export function Marquee() {
  return (
    <div
      data-testid="editorial-marquee"
      className="overflow-hidden border-y border-line bg-ribbon py-4"
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {ITEMS.concat(ITEMS).map((text, i) => (
              <span
                key={i}
                className="flex items-center font-heading text-xs uppercase tracking-[0.28em] text-[#3B3026] sm:text-sm"
              >
                <span className="px-8">{text}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-clay">
                  <path d="M5 0 L6.5 3.5 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 3.5 Z" fill="currentColor" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
