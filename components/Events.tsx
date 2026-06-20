import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";
import { fetchCuratedEvents, type EventItem } from "@/lib/sources/notion";

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

const sourceLabel: Record<EventItem["source"], string> = {
  sparck: "",
  luma: "vía Luma",
  eventbrite: "vía Eventbrite",
  meetup: "vía Meetup",
};

function pickItems(items: EventItem[]): { own: EventItem[]; external: EventItem[] } {
  const own = items.filter((i) => i.source === "sparck").slice(0, 2);
  const external = items.filter((i) => i.source !== "sparck").slice(0, 4);
  return { own, external };
}

export default async function Events() {
  const all = await fetchCuratedEvents();
  const { own, external } = pickItems(all);
  const upcoming = [...own, ...external];

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

      {upcoming.length === 0 ? (
        <ScrollReveal as="div" threshold={0.08}>
          <div
            className="event-list"
            style={{
              padding: "48px 32px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "14px",
              background: "rgba(13, 17, 23, 0.4)",
            }}
          >
            Pronto habrá eventos.
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal as="div" threshold={0.08}>
          <div className="event-list">
            {upcoming.map((ev, i) => (
              <a
                key={`${ev.url}-${i}`}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
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
                      fontFamily:
                        "var(--font-geist-mono), ui-monospace, monospace",
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
                    <span>{ev.title}</span>
                    {(ev.notes || ev.extraTags.length > 0) && (
                      <span className="event-badges">
                        {ev.notes && (
                          <span
                            className="event-badge note"
                            title={ev.notes}
                            aria-label={`Nota: ${ev.notes}`}
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="9" y1="13" x2="15" y2="13" />
                              <line x1="9" y1="17" x2="13" y2="17" />
                            </svg>
                            nota
                          </span>
                        )}
                        {ev.extraTags.map((t) => (
                          <span key={t} className="event-badge tag">
                            {t}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{ev.meta}</span>
                    {sourceLabel[ev.source] && (
                      <>
                        <span aria-hidden style={{ opacity: 0.4 }}>
                          ·
                        </span>
                        <span
                          style={{
                            fontFamily:
                              "var(--font-geist-mono), ui-monospace, monospace",
                            fontSize: "10px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            opacity: 0.7,
                          }}
                        >
                          {sourceLabel[ev.source]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`event-tag ${tagClass[ev.type] ?? ""}`}>
                  {tagLabel[ev.type] ?? ev.type}
                </span>
              </a>
            ))}
          </div>
        </ScrollReveal>
      )}
    </section>
  );
}
