import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import CharTitle from "@/components/CharTitle";
import ScrollReveal from "@/components/ScrollReveal";
import NewsList from "@/components/NewsList";
import { fetchPublishedNews } from "@/lib/sources/notion-news";

export const metadata: Metadata = {
  title: "Noticias",
  description:
    "Noticias diarias del ámbito de la inteligencia artificial, curadas por Spärck.",
};

export const revalidate = 3600;

export default async function NoticiasPage() {
  const news = await fetchPublishedNews();

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
              Noticias de IA
            </CharTitle>
            <p
              style={{
                fontSize: "16px",
                maxWidth: "520px",
                lineHeight: 1.7,
                color: "var(--muted)",
              }}
            >
              Papers, lanzamientos y novedades del ecosistema de inteligencia
              artificial, curadas a diario por la comunidad.
            </p>
          </section>

          <section className="event-section" style={{ paddingBottom: "120px" }}>
            <ScrollReveal as="div" threshold={0.08}>
              <NewsList
                news={news}
                emptyMessage="Pronto habrá noticias."
              />
            </ScrollReveal>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
