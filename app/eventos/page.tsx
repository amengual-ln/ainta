import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import CharTitle from "@/components/CharTitle";
import ScrollReveal from "@/components/ScrollReveal";
import EventList from "@/components/EventList";
import { fetchCuratedEvents } from "@/lib/sources/notion";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Agenda completa de talleres, charlas y eventos del ecosistema IA curados por Spärck.",
};

export const revalidate = 3600;


export default async function EventosPage() {
  const all = await fetchCuratedEvents();
  const own = all.filter((e) => e.source === "sparck");
  const external = all.filter((e) => e.source !== "sparck");

  return (
    <>
      <PageHeader />
      <main className="relative z-10">
        <div className="mx-auto px-6" style={{ maxWidth: "1080px" }}>
          <section
            className="page-hero"
            style={{ paddingTop: "120px", paddingBottom: "60px" }}
          >
            <CharTitle
              className="font-display text-white"
              style={{
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: "24px",
              }}
            >
              Agenda de eventos
            </CharTitle>
            <p
              style={{
                fontSize: "16px",
                maxWidth: "520px",
                lineHeight: 1.7,
                color: "var(--muted)",
              }}
            >
              Talleres propios y eventos del ecosistema IA que releemos para
              ayudarte a encontrar los que valen la pena.
            </p>
          </section>

          {own.length > 0 && (
            <section className="event-section" style={{ paddingBottom: "80px" }}>
              <ScrollReveal as="div" threshold={0.08}>
                <EventList
                  events={own}
                  emptyMessage="Pronto habrá eventos de Spärck."
                />
              </ScrollReveal>
            </section>
          )}

          <section
            className="event-section"
            style={{ paddingBottom: "120px" }}
          >
            <ScrollReveal as="div" threshold={0.08}>
              <EventList
                events={external}
                emptyMessage="Pronto habrá eventos del ecosistema."
              />
            </ScrollReveal>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
