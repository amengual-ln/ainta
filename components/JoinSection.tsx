import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";
import NewsletterForm from "./NewsletterForm";
import PhosphorIcon from "./PhosphorIcon";

export default function JoinSection() {
  return (
    <section id="unirse" className="join-section relative z-10">
      <ScrollReveal as="div" className="join-layout" threshold={0.1}>
        <div className="join-copy">
          <CharTitle className="home-section-title">Sumate a Spärck</CharTitle>
          <p>
            Cada tanto te mandamos los eventos que vienen, recursos nuevos y
            novedades de la comunidad. Sin spam.
          </p>
        </div>
        <div id="newsletter" className="join-form">
          <NewsletterForm />
        </div>
        <div className="join-community">
          <p>
            También podés sumarte a la comunidad de WhatsApp para compartir y
            enterarte de todo.
          </p>
          <a
            href="https://chat.whatsapp.com/FzOeQXKbnOrGfrVlgb41k1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost join-community-link"
          >
            <PhosphorIcon name="WhatsappLogo" size={20} weight="bold" aria-hidden="true" />
            Sumarme a WhatsApp
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
