import ScrollReveal from "./ScrollReveal";

const pillars = [
  {
    icon: "🧠",
    name: "Aprendizaje real",
    desc: "Talleres y clases sobre lo que importa: Python desde cero, fundamentos de ML, gestión de proyectos, deployment. Sin humo.",
  },
  {
    icon: "📡",
    name: "Radar de eventos",
    desc: "Curación de hackathons, charlas, conferencias y oportunidades externas. Para que no te pierdas nada del ecosistema.",
  },
  {
    icon: "🔗",
    name: "Red de pares",
    desc: "Conectate con otros estudiantes y graduados. Armá grupos de estudio, encontrá compañeros de proyecto, creá con otros.",
  },
];

export default function Pillars() {
  return (
    <section
      id="pilares"
      className="relative z-10"
      style={{ padding: "100px 0" }}
    >
      <ScrollReveal className="max-w-[520px] mb-16">
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
          Qué hacemos
        </div>
        <h2
          className="font-display text-white"
          style={{
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          Tres ejes que nos mueven
        </h2>
        <p
          className="font-body text-muted"
          style={{ fontSize: "16px", maxWidth: "480px", lineHeight: 1.7 }}
        >
          No somos un foro. Somos un espacio donde se aprende haciendo, se
          comparte sin filtro y se construye en comunidad.
        </p>
      </ScrollReveal>

      <ScrollReveal
        as="div"
        className="grid"
        threshold={0.08}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-3 overflow-hidden"
          style={{
            gap: "2px",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          {pillars.map((p) => (
            <div
              key={p.name}
              className="pillar-card hover-card"
              style={{
                background: "var(--card-bg)",
                backdropFilter: "blur(12px)",
                padding: "36px 32px",
              }}
            >
              <div
                className="flex items-center justify-center mb-5"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--indigo-dim)",
                  fontSize: "18px",
                }}
              >
                {p.icon}
              </div>
              <div
                className="font-display text-white mb-2.5"
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {p.name}
              </div>
              <p
                className="font-body text-muted"
                style={{ fontSize: "14px", lineHeight: 1.65 }}
              >
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
