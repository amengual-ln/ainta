import type { EventItem } from "@/lib/sources/notion";

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

interface EventListProps {
  events: EventItem[];
  emptyMessage?: string;
}

function formatTime(isoTime: string | null): string | null {
  if (!isoTime) return null;
  const [hours, minutes] = isoTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const suffix = hours >= 12 ? "hs" : "hs";
  const h24 = hours;
  const m = String(minutes).padStart(2, "0");
  return `${h24}:${m}${suffix}`;
}

function renderMarkdownish(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={key++}>{text.slice(last, match.index)}</span>);
    }
    if (match[1]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else {
      parts.push(<em key={key++}>{match[4]}</em>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) {
    parts.push(<span key={key++}>{text.slice(last)}</span>);
  }
  return parts;
}

export default function EventList({ events, emptyMessage = "Pronto habrá eventos." }: EventListProps) {
  if (events.length === 0) {
    return (
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
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="event-list">
      {events.map((ev, i) => (
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
            {(ev.summary || ev.notes) && (
              <div className="event-description">
                {renderMarkdownish(ev.summary || ev.notes)}
              </div>
            )}
            <div className="event-title-meta">
              <span className="event-meta-date">
                {ev.day} {ev.month}
                {ev.time && ` · ${formatTime(ev.time)}`}
              </span>
              <span>{ev.meta}</span>
              
            </div>
          </div>
          <span className={`event-tag ${tagClass[ev.type] ?? ""}`}>
            {tagLabel[ev.type] ?? ev.type}
          </span>
        </a>
      ))}
    </div>
  );
}
