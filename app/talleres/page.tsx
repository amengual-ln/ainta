import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Talleres",
  description: "Talleres propios de la comunidad AINTA: próximos y pasados.",
};

export default function TalleresPage() {
  return (
    <>
      <Nav />
      <main className="relative z-10">
        <div className="mx-auto px-6" style={{ maxWidth: "1080px" }}>
          <section style={{ minHeight: "100vh", padding: "160px 0 80px" }}>
            <div
              className="font-body mb-4"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--indigo-soft)",
              }}
            >
              Próximamente · v2
            </div>
            <h1
              className="font-display text-white mb-6"
              style={{
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Talleres propios
            </h1>
            <p
              className="font-body text-muted"
              style={{ fontSize: "16px", maxWidth: "520px", lineHeight: 1.7 }}
            >
              Próximos talleres con inscripción, talleres pasados con grabación y
              materiales. Disponible en la próxima iteración.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
