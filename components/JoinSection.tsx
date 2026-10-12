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
          <a
            href="https://chat.whatsapp.com/FzOeQXKbnOrGfrVlgb41k1"
            target="_blank"
            rel="noopener noreferrer"
            className="join-community-link"
          >
            <PhosphorIcon name="WhatsappLogo" size={20} weight="bold" aria-hidden="true" />
            O charlá con la comunidad en el grupo de WhatsApp
          </a>
        </div>
        <div id="newsletter" className="join-form">
          <NewsletterForm />
        </div>
      </ScrollReveal>
    </section>
  );
}
