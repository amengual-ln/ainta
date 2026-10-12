import CharTitle from "./CharTitle";
import KarenGlyphPortrait from "./KarenGlyphPortrait";
import ScrollReveal from "./ScrollReveal";

export default function OriginSection() {
  return (
    <section id="origen" className="origin-section relative z-10">
      <div className="origin-layout">
        <CharTitle className="home-section-title origin-title">
          ¿Por qué “Spärck”?
        </CharTitle>
        <ScrollReveal as="div" className="origin-visual" threshold={0.16}>
          <figure className="origin-figure">
            <div className="origin-portrait">
              <KarenGlyphPortrait />
            </div>
            <figcaption>
              Karen Spärck Jones · 1935–2007
              <span className="portrait-credit">
                Adaptación en glifos de una{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Karen_Sp%C3%A4rck.jpg" target="_blank" rel="noopener noreferrer">foto de University of Cambridge</a>
                {" · "}
                <a href="https://creativecommons.org/licenses/by/2.5/" target="_blank" rel="noopener noreferrer">CC BY 2.5</a>
              </span>
            </figcaption>
          </figure>
        </ScrollReveal>
        <ScrollReveal as="div" className="origin-copy" threshold={0.12}>
          <div className="origin-story">
            <p>
              Karen Spärck Jones formuló la frecuencia inversa de documento, o
              IDF: una forma de reconocer qué palabras contienen más información.
              Su trabajo ayudó a sentar las bases de los buscadores modernos y de
              tecnologías que hoy permiten interactuar usando lenguaje.
            </p>
            <p>
              Pero no elegimos su nombre solamente por su aporte técnico.
              Dedicó su carrera a investigar, enseñar y compartir conocimiento
              para ampliar lo que más personas podían comprender y construir.
            </p>
            <p>
              También promovió la participación de las mujeres en una disciplina
              dominada por hombres. Creía que la computación era demasiado
              importante para quedar en manos de unos pocos.
            </p>
            <p className="origin-principle">
              Spärck representa eso: conocimiento que circula, tecnología con
              propósito y una comunidad donde más personas puedan aprender,
              participar y crear.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
