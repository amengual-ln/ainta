import { getEventDateParts } from "@/lib/events";
import type { EventItem } from "@/lib/sources/notion";
import PhosphorIcon from "./PhosphorIcon";
import EventCover from "./EventCover";

export default function NextEventCard({ event, coverUrl }: { event: EventItem; coverUrl?: string | null }) {
  const date = getEventDateParts(event.startAt);
  if (!date) return null;

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="next-event-card"
      aria-label={`${event.title}, ${date.day} de ${date.monthLabel}. Ver evento (abre en una pestaña nueva)`}
    >
      {coverUrl ? <EventCover key={coverUrl} src={coverUrl} /> : null}
      <div className="next-event-info">
        <span className="next-event-head">
          <span className="next-event-eyebrow">
            {event.source === "sparck" ? "Próximo evento Spärck" : "Evento destacado"}
          </span>
          {event.cost ? <span className="next-event-cost">{event.cost}</span> : null}
        </span>
        <h2 className="next-event-title">{event.title}</h2>
        <span className="next-event-date">
          {date.day} de {date.monthLabel}{date.time ? ` · ${date.time} h` : ""}
        </span>
        {event.location ? (
          <span className="next-event-place">
            <PhosphorIcon name="MapPin" size={16} aria-hidden="true" />
            {event.location}
          </span>
        ) : null}
      </div>
    </a>
  );
}
