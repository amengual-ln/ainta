import Link from "next/link";
import { getEventDateParts, publicTag } from "@/lib/events";
import type { EventItem } from "@/lib/sources/notion";
import CharTitle from "./CharTitle";
import ScrollReveal from "./ScrollReveal";

// Cartelera: una fila por evento, la fecha manda.
export default function UpcomingEvents({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section id="agenda" className="home-section relative z-10" aria-label="Próximos eventos">
      <ScrollReveal className="home-section-head">
        <CharTitle className="home-section-title">Próximos eventos</CharTitle>
        <Link href="/eventos" className="text-link">
          Agenda completa ↗
        </Link>
      </ScrollReveal>

      <ScrollReveal threshold={0.08}>
        <ul className="agenda-list">
          {events.map((event) => {
            const date = getEventDateParts(event.startAt);
            if (!date) return null;
            const own = event.source === "sparck";
            const tags = [
              ...(own ? ["Organiza Spärck"] : []),
              ...(event.cost === "Pago" ? ["Pago"] : []),
              ...event.extraTags.map(publicTag),
            ].slice(0, 2);
            return (
              <li key={event.url}>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`agenda-row${own ? " is-own" : ""}`}
                >
                  <span className="agenda-date">
                    <strong>{date.day}</strong> {date.month}
                  </span>
                  <span className="agenda-main">
                    <span className="agenda-title">{event.title}</span>
                    <span className="agenda-place">
                      {[date.time && `${date.time} h`, event.location].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="agenda-tags">
                    {tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </ScrollReveal>
    </section>
  );
}
