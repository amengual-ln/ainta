import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";
import NewsletterForm from "./NewsletterForm";

export default function JoinSection() {
  return (
    <section
      id="unirse"
      className="relative z-10"
      style={{ padding: "80px 0 140px" }}
    >
      <ScrollReveal as="div" threshold={0.1}>
        <div
          id="newsletter"
          className="text-center"
          style={{
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "72px 64px",
            background: "var(--card-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            overflow: "hidden",
          }}
        >
          <CharTitle
            className="font-display text-white"
            style={{
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              marginBottom: "16px",
            }}
          >
            Sumate a Spärck
          </CharTitle>
          <p
            style={{
              fontSize: "16px",
              maxWidth: "420px",
              marginBottom: "40px",
              lineHeight: 1.65,
              color: "var(--muted)",
              margin: "0 auto 40px",
            }}
          >
            Es gratis, abierto, y está hecho por estudiantes para estudiantes.
          </p>

          <NewsletterForm />
        </div>
      </ScrollReveal>
    </section>
  );
}
