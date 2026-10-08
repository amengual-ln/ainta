import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import NextEventCard from "@/components/NextEventCard";
import Pillars from "@/components/Pillars";
import UpcomingEvents from "@/components/UpcomingEvents";
import OriginSection from "@/components/OriginSection";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";
import { fetchCuratedEvents } from "@/lib/sources/notion";

export const metadata: Metadata = {
  title: { absolute: "Spärck | Comunidad de estudiantes de IA" },
  description: "Comunidad abierta de estudiantes y graduados de IA y datos en Argentina. Eventos, recursos y una red de pares.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default async function HomePage() {
  const events = await fetchCuratedEvents();
  const nextOwnEvent = events.find((event) => event.source === "sparck");

  return (
    <>
      <SiteHeader />
      <main className="relative z-10 site-shell">
        <Hero aside={nextOwnEvent && <NextEventCard event={nextOwnEvent} />} />
        <Pillars />
        <UpcomingEvents events={events.slice(0, 4)} />
        <OriginSection />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
