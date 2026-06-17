import PhosphorIcon from "./PhosphorIcon";
import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";

const pillars = [
  {
    icon: "GraduationCap" as const,
    name: "Aprendizaje real",
    desc: "Talleres y clases sobre lo que importa: fundamentos de IA y programación, gestión de proyectos, deployment. Lo que las aulas no llegaron a darnos, lo cubrimos entre todos.",
  },
  {
    icon: "CalendarBlank" as const,
    name: "Radar del ecosistema",
    desc: "Eventos, charlas, conferencias y oportunidades externas. Para que no te pierdas nada relevante del mundo de la IA.",
  },
  {
    icon: "UsersThree" as const,
    name: "Red de pares",
    desc: "Conectate con otros estudiantes, graduados y referentes del area. Armá grupos de estudio, encontrá compañeros de proyecto, oportunidades, creá con otros.",
  },
];

export default function Pillars() {
  return (
    <section
      id="pilares"
      className="relative z-10"
      style={{ padding: "100px 0" }}
    >
      <ScrollReveal className="max-w-[560px] mb-16">
        <CharTitle
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
        </CharTitle>
      </ScrollReveal>

      <ScrollReveal as="div" threshold={0.08}>
        <div
          className="grid grid-cols-1 md:grid-cols-3 overflow-hidden"
          style={{
            gap: "2px",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          {pillars.map((p) => {
            return (
              <div
                key={p.name}
                className="pillar-card hover-card"
                style={{
                  background: "var(--card-bg)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  padding: "36px 32px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="flex items-center justify-center mb-5"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "var(--accent-dim)",
                    color: "var(--accent-soft)",
                  }}
                >
                  <PhosphorIcon name={p.icon} size={20} weight="regular" />
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
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "var(--muted)",
                    flex: 1,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
