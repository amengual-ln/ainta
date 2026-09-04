import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import EventGrid from "@/components/EventGrid";
import { fetchCuratedEvents } from "@/lib/sources/notion";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Agenda de talleres, charlas y encuentros de IA curados por Spärck.",
  alternates: { canonical: "/eventos" },
};

export const revalidate = 3600;

export default async function EventosPage() {
  const events = await fetchCuratedEvents();

  return (
    <>
      <SiteHeader />
      <main className="relative z-10 site-shell page-main">
        <header className="page-intro">
          <h1>Eventos de IA y datos</h1>
          <p>Charlas, talleres y encuentros elegidos por su valor para aprender y conocer gente del ecosistema.</p>
        </header>
        <EventGrid events={events} grouped />
      </main>
      <Footer />
    </>
  );
}
