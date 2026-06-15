import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Agenda completa de talleres, charlas y eventos del ecosistema IA.",
};

export default function EventosPage() {
  return (
    <>
      <main className="relative z-10">
        <div className="mx-auto px-6" style={{ maxWidth: "1080px" }}>
          <section style={{ minHeight: "100dvh", padding: "160px 0 80px" }}>
            <div
              style={{
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent-soft)",
                marginBottom: "16px",
              }}
            >
              Próximamente · v2
            </div>
            <h1
              className="font-display text-white"
              style={{
                fontSize: "clamp(36px, 5vw, 60px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: "24px",
              }}
            >
              Agenda completa
            </h1>
            <p
              style={{
                fontSize: "16px",
                maxWidth: "520px",
                lineHeight: 1.7,
                color: "var(--muted)",
              }}
            >
              Filtros por tipo (Taller / Charla / Externo / Hackathon),
              inscripción y agregado a calendario. Disponible en la próxima
              iteración.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
