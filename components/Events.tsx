import ScrollReveal from "./ScrollReveal";
import { events } from "@/lib/events";

const tagClass: Record<string, string> = {
  taller: "workshop",
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
        <div>
          <div
            className="font-body mb-4"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--indigo-soft)",
            }}
          >
            Agenda
          </div>
          <h2
            className="font-display text-white"
            style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Próximos eventos
          </h2>
        </div>
        <a href="/eventos" className="btn-ghost btn-sm">
          Ver todos →
        </a>
      </ScrollReveal>

      <ScrollReveal as="div" threshold={0.08}>
        <div
          className="flex flex-col overflow-hidden"
          style={{
            gap: "2px",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
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
                background: "var(--card-bg)",
                backdropFilter: "blur(12px)",
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
                  className="font-body"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--indigo-soft)",
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
                <div className="text-[13px] text-muted">{ev.meta}</div>
              </div>
              <span
                className={`event-tag ${tagClass[ev.type] ?? ""}`}
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {tagLabel[ev.type] ?? ev.type}
              </span>
            </a>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
