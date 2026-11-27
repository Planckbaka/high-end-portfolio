import Image from "next/image";

const HERO_TICKS = Array.from({ length: 36 }, (_, idx) => {
  const angle = (idx * 10 * Math.PI) / 180;
  const isMajor = idx % 3 === 0;
  const r1 = isMajor ? 182 : 186;
  const r2 = 192;
  return {
    x1: (210 + r1 * Math.cos(angle)).toFixed(1),
    y1: (190 + r1 * Math.sin(angle)).toFixed(1),
    x2: (210 + r2 * Math.cos(angle)).toFixed(1),
    y2: (190 + r2 * Math.sin(angle)).toFixed(1),
    isMajor,
  };
});

export function HeroTopologyPlate({ paused = false }: { paused?: boolean }) {
  return (
    <div className="salon-art-stage">
      <Image
        src="/images/editorial/hero-inquiry-plate.webp"
        alt="Editorial pen-and-ink study of an open notebook, geometric polyhedron, and botanical roots"
        width={1080}
        height={1080}
        priority
        fetchPriority="high"
        className="salon-art-img"
      />
      <svg
        viewBox="0 0 420 380"
        className="salon-art-overlay-svg"
        aria-hidden="true"
      >
        <g className={paused ? undefined : "ink-orbit-slow"}>
          <circle
            cx="210"
            cy="190"
            r="188"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="2 5"
            opacity="0.45"
          />
          {HERO_TICKS.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="currentColor"
              strokeWidth={t.isMajor ? "0.95" : "0.6"}
              opacity={t.isMajor ? "0.55" : "0.28"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

const DISCIPLINE_PLATES: Record<string, { src: string }> = {
  Go: { src: "/images/editorial/plate-go-concurrency.webp" },
  Python: { src: "/images/editorial/plate-python-orchestration.webp" },
  LLM: { src: "/images/editorial/plate-systems-llm.webp" },
  Systems: { src: "/images/editorial/plate-systems-llm.webp" },
};

export function DisciplineInkPlate({ category }: { category: string }) {
  const plate = DISCIPLINE_PLATES[category] ?? DISCIPLINE_PLATES.Systems;
  return (
    <Image
      src={plate.src}
      alt=""
      width={800}
      height={597}
      loading="lazy"
      className="discipline-plate-img"
    />
  );
}
