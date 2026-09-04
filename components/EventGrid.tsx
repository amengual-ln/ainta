import { getEventDateParts, groupEventsByMonth } from "@/lib/events";
import type { EventItem } from "@/lib/sources/notion";
import PhosphorIcon from "./PhosphorIcon";

interface EventGridProps {
  events: EventItem[];
  grouped?: boolean;
  emptyMessage?: string;
}

const eventTypeLabels: Partial<Record<EventItem["type"], string>> = {
  taller: "Taller",
  charla: "Charla",
  hackathon: "Hackathon",
};

function cleanText(value: string): string {
  return value.replace(/\*\*?|__/g, "").trim();
}

function EventCard({ event }: { event: EventItem }) {
  const date = getEventDateParts(event.startAt);
  if (!date) return null;
  const waitlist = event.notes.toLowerCase().includes("lista de espera");
  const description = cleanText(event.summary || (waitlist ? "" : event.notes));
  const location = event.location && event.location.toLowerCase() !== event.modality?.toLowerCase()
    ? event.location
    : null;

  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="event-card"
    >
      <div className="event-card-date" aria-label={`${date.day} de ${date.monthLabel}`}>
        <strong>{date.day}</strong>
        <span>{date.month}</span>
      </div>
      <div className="event-card-body">
        <div className="event-card-heading">
          <h3>{event.title}</h3>
          <PhosphorIcon name="ArrowUpRight" size={17} aria-hidden="true" />
        </div>
        <div className="event-card-meta">
          {date.time && <span>{date.time} h</span>}
          {event.modality && <span>{event.modality}</span>}
          {location && <span>{location}</span>}
        </div>
        {description && <p>{description}</p>}
        <div className="event-card-badges">
          {event.source === "sparck" && <span className="is-sparck">Spärck</span>}
          {eventTypeLabels[event.type] && <span>{eventTypeLabels[event.type]}</span>}
          {event.cost === "Pago" && <span className="is-paid">Pago</span>}
          {waitlist && <span className="is-waitlist">Lista de espera</span>}
          {event.extraTags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
    </a>
  );
}

function Grid({ events }: { events: EventItem[] }) {
  return (
    <div className="event-grid">
      {events.map((event) => <EventCard key={event.url} event={event} />)}
    </div>
  );
}

export default function EventGrid({
  events,
  grouped = false,
  emptyMessage = "Todavía no hay próximos eventos curados.",
}: EventGridProps) {
  if (events.length === 0) return <div className="empty-state">{emptyMessage}</div>;
  if (!grouped) return <Grid events={events} />;

  return (
    <div className="event-months">
      {groupEventsByMonth(events).map((group) => (
        <section key={group.key} className="event-month" aria-labelledby={`month-${group.key}`}>
          <h2 id={`month-${group.key}`}>{group.label}</h2>
          <Grid events={group.events} />
        </section>
      ))}
    </div>
  );
}
