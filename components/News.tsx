import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";
import NewsList from "./NewsList";
import { fetchPublishedNews } from "@/lib/sources/notion-news";

export default async function News() {
  const all = await fetchPublishedNews();
  const latest = all.slice(0, 5);

  return (
    <section
      id="noticias"
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
          Noticias de IA
        </CharTitle>
        <a href="/noticias" className="btn-ghost btn-sm">
          Ver todas →
        </a>
      </ScrollReveal>

      <ScrollReveal as="div" threshold={0.08}>
        <NewsList news={latest} />
      </ScrollReveal>
    </section>
  );
}
