import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";
import EventList from "./EventList";
import { fetchCuratedEvents, type EventItem } from "@/lib/sources/notion";

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

      <ScrollReveal as="div" threshold={0.08}>
        <EventList events={upcoming} />
      </ScrollReveal>
    </section>
  );
}