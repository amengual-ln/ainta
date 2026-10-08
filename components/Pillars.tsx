import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";

const pillars = [
  {
    name: "Aprendizaje real",
    desc: "Talleres y clases sobre lo que importa: fundamentos de IA y programación, gestión de proyectos, deployment. Lo que las aulas no llegaron a darnos, lo cubrimos entre todos.",
    href: "/recursos",
  },
  {
    name: "Radar del ecosistema",
    desc: "Eventos, charlas, conferencias y oportunidades externas. Para que no te pierdas nada relevante del mundo de la IA.",
    href: "/eventos",
  },
  {
    name: "Red de pares",
    desc: "Conectate con otros estudiantes, graduados y referentes del área. Armá grupos de estudio, encontrá compañeros de proyecto, oportunidades, creá con otros.",
    href: "/#unirse",
  },
];

// Los tres ejes como un índice: el término, qué es y a dónde lleva.
export default function Pillars() {
  return (
    <section id="pilares" className="home-section relative z-10" aria-label="Qué hacemos">
      <ScrollReveal className="home-section-head">
        <CharTitle className="home-section-title">Qué hacemos</CharTitle>
      </ScrollReveal>

      <ScrollReveal threshold={0.08}>
        <ul className="index-list">
          {pillars.map((pillar) => (
            <li key={pillar.name}>
              <Link href={pillar.href} className="index-row">
                <span className="index-term">{pillar.name}</span>
                <span className="index-desc">{pillar.desc}</span>
                <span className="index-path" aria-hidden="true">{pillar.href.replace("/#", "#")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </section>
  );
}
