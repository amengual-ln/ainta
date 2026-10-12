import CharTitle from "./CharTitle";
import KarenPortrait from "./KarenPortrait";
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
              <KarenPortrait />
            </div>
            <figcaption className="portrait-credit">
              Ilustración basada en fotos de{" "}
              <a href="https://www.cl.cam.ac.uk/misc/obituaries/sparck-jones/photos/" target="_blank" rel="noopener noreferrer">University of Cambridge</a>
              {" · "}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
              {" / "}
              <a href="https://creativecommons.org/licenses/by/2.5/" target="_blank" rel="noopener noreferrer">2.5</a>
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
            <div className="origin-idf">
              <p className="origin-idf-formula" role="math" aria-label="idf de t es igual al logaritmo de N dividido por n sub t">
                <span aria-hidden="true">idf(t) = log(N / n<sub>t</sub>)</span>
              </p>
              <p className="origin-idf-note">
                N: documentos totales · n<sub>t</sub>: documentos que contienen t.
              </p>
            </div>
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
