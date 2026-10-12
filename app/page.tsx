import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Pillars from "@/components/Pillars";
import NextEventCard from "@/components/NextEventCard";
import OriginSection from "@/components/OriginSection";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";
import { fetchCuratedEvents } from "@/lib/sources/notion";
import { selectHeroEvent } from "@/lib/events";

export const metadata: Metadata = {
  title: { absolute: "Spärck | Comunidad de estudiantes de IA" },
  description: "Comunidad abierta de estudiantes y graduados de IA y datos en Argentina. Eventos, recursos y una red de pares.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default async function HomePage() {
  const events = await fetchCuratedEvents();
  const heroEvent = selectHeroEvent(events);

  return (
    <>
      <SiteHeader minimal />
      <main className="relative z-10 site-shell">
        <Hero aside={heroEvent ? <NextEventCard event={heroEvent} /> : null} />
        <Pillars />
        <OriginSection />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
