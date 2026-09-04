import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Pillars from "@/components/Pillars";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { absolute: "Spärck | Comunidad de estudiantes de IA" },
  description: "Comunidad abierta de estudiantes y graduados de IA. Talleres, recursos y una red de pares.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <SiteHeader minimal />
      <main className="relative z-10 site-shell">
        <Hero />
        <Pillars />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
