import { getEventDateParts } from "@/lib/events";
import type { EventItem } from "@/lib/sources/notion";
import PhosphorIcon from "./PhosphorIcon";

// Destaca en el hero el próximo evento organizado por Spärck.
export default function NextEventCard({ event }: { event: EventItem }) {
  const date = getEventDateParts(event.startAt);
  if (!date) return null;

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="next-event-card"
      aria-label={`${event.title}, ${date.day} de ${date.monthLabel}. Reservar lugar (abre en una pestaña nueva)`}
    >
      <span className="next-event-eyebrow">Próximo evento Spärck</span>
      <span className="next-event-date">
        <strong>{date.day}</strong>
        <span>{date.monthLabel}{date.time ? ` · ${date.time} h` : ""}</span>
      </span>
      <span className="next-event-title">{event.title}</span>
      {event.location && (
        <span className="next-event-place">
          <PhosphorIcon name="MapPin" size={16} aria-hidden="true" />
          {event.location}
        </span>
      )}
      <span className="next-event-cta">
        {event.cost === "Pago" ? "Ver entradas" : "Reservar lugar gratis"}
        <PhosphorIcon name="ArrowUpRight" size={16} aria-hidden="true" />
      </span>
    </a>
  );
}
