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
                className="event-row event-item hover-card no-accent"
              >
                <div className="event-date">
                  <div className="event-day">{ev.day}</div>
                  <div className="event-month">{ev.month}</div>
                </div>
                <div className="event-body">
                  <div className="event-title">
                    <span>{ev.title}</span>
                    {(ev.notes || ev.extraTags.length > 0 || ev.cost === "Pago") && (
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
                        {ev.cost === "Pago" && (
                          <span
                            className="event-badge cost"
                            title="Evento pago"
                            aria-label="Evento pago"
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
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            pago
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
                  <div className="event-title-meta">
                    <span className="event-meta-date">
                      {ev.day} {ev.month}
                    </span>
                    <span>{ev.meta}</span>
                    {sourceLabel[ev.source] && (
                      <>
                        <span aria-hidden className="event-meta-dot">·</span>
                        <span className="event-meta-source">
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