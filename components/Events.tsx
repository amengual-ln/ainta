import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";
import { events } from "@/lib/events";

const tagClass: Record<string, string> = {
  taller: "taller",
  charla: "charla",
  externo: "externo",
  hackathon: "externo",
};

const tagLabel: Record<string, string> = {
  taller: "Taller",
  charla: "Charla",
  externo: "Externo",
  hackathon: "Externo",
};

export default function Events() {
  const upcoming = events.slice(0, 4);

  return (
    <section
      id="eventos"
      className="relative z-10"
      style={{ padding: "80px 0 100px" }}
    >
      <ScrollReveal
        className="flex flex-wrap items-end justify-between mb-12 gap-5"
        threshold={0.1}
      >
        <CharTitle
          className="font-display text-white"
          style={{
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          Próximos eventos
        </CharTitle>
        <a href="/eventos" className="btn-ghost btn-sm">
          Ver todos →
        </a>
      </ScrollReveal>

      <ScrollReveal as="div" threshold={0.08}>
        <div className="event-list">
          {upcoming.map((ev, i) => (
            <a
              key={`${ev.day}-${ev.month}-${i}`}
              href={ev.url ?? "#"}
              className="event-item hover-card no-accent"
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr auto",
                alignItems: "center",
                gap: "24px",
                padding: "24px 32px",
                background: "rgba(13, 17, 23, 0.4)",
              }}
            >
              <div className="text-center">
                <div
                  className="font-display text-white"
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {ev.day}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--accent-soft)",
                    marginTop: "2px",
                  }}
                >
                  {ev.month}
                </div>
              </div>
              <div>
                <div
                  className="font-display text-white mb-1"
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {ev.title}
                </div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>{ev.meta}</div>
              </div>
              <span className={`event-tag ${tagClass[ev.type] ?? ""}`}>
                {tagLabel[ev.type] ?? ev.type}
              </span>
            </a>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
