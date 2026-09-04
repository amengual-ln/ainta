import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ResourceGrid from "@/components/ResourceGrid";
import {
  resourceCategoryLabels,
  resourceCategoryOrder,
  resources,
} from "@/lib/resources";

export const metadata: Metadata = {
  title: "Recursos",
  description: "Biblioteca curada de cursos, guías y prácticas para aprender IA.",
  alternates: { canonical: "/recursos" },
};

export default function RecursosPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-10 site-shell page-main">
        <header className="page-intro">
          <h1>Recursos para aprender haciendo</h1>
          <p>Cursos, guías y prácticas para avanzar desde los fundamentos hasta proyectos completos.</p>
        </header>

        <div className="resource-groups">
          {resourceCategoryOrder.map((category) => {
            const items = resources.filter((resource) => resource.category === category);
            return (
              <section key={category} aria-labelledby={`resources-${category}`}>
                <h2 id={`resources-${category}`}>{resourceCategoryLabels[category]}</h2>
                <ResourceGrid resources={items} />
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
