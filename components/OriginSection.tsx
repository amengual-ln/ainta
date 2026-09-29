import CharTitle from "./CharTitle";
import KarenGlyphPortrait from "./KarenGlyphPortrait";
import ScrollReveal from "./ScrollReveal";

export default function OriginSection() {
  return (
    <section id="origen" className="origin-section relative z-10">
      <div className="origin-layout">
        <ScrollReveal as="div" className="origin-visual" threshold={0.16}>
          <figure>
            <div className="origin-portrait">
              <KarenGlyphPortrait />
            </div>
            <figcaption>Karen Spärck Jones, 1935-2007</figcaption>
          </figure>
        </ScrollReveal>

        <ScrollReveal as="div" className="origin-copy" threshold={0.12}>
          <CharTitle
            className="font-display text-white"
            style={{
              fontSize: "clamp(34px, 4.8vw, 58px)",
              fontWeight: 600,
              letterSpacing: "-0.045em",
              lineHeight: 1.05,
              marginBottom: "32px",
            }}
          >
            Spärck. Con “ck”.
          </CharTitle>

          <div className="origin-story">
            <p>
              Nuestro nombre viene de Karen Spärck Jones, pionera del
              procesamiento del lenguaje y la recuperación de información.
            </p>
            <p>
              En 1972 formuló la frecuencia inversa de documento, o IDF: una
              manera de reconocer qué palabras contienen más información. Su
              trabajo ayudó a construir las bases de los buscadores modernos y
              de muchas de las tecnologías con las que hoy interactuamos usando
              lenguaje.
            </p>
            <p>
              Pero no elegimos su nombre solamente por su aporte técnico.
              Karen desarrolló su carrera dentro de la investigación y la
              educación, formando estudiantes, compartiendo conocimiento y
              trabajando para que los avances de la computación ampliaran lo
              que las personas podían comprender y construir.
            </p>
            <p>
              También defendió activamente la participación de las mujeres en
              una disciplina que durante gran parte de su vida estuvo dominada
              por hombres. Su convicción era clara: la computación era demasiado
              importante para quedar en manos de unos pocos.
            </p>
            <p className="origin-principle">
              Spärck representa eso: conocimiento que circula, tecnología con
              propósito y una comunidad en la que más personas puedan aprender,
              participar y crear.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
