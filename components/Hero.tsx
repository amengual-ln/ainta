export default function Hero() {
  return (
    <section
      className="relative z-10 flex items-center"
      style={{ minHeight: "100vh", padding: "120px 0 80px" }}
    >
      <div className="max-w-[780px]">
        <div
          className="fade-up eyebrow-anim inline-flex items-center gap-2 mb-8 font-body"
          style={{
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--indigo-soft)",
          }}
        >
          <span className="eyebrow-line" />
          Comunidad de estudiantes de IA
        </div>

        <h1
          className="fade-up hero-title-anim font-display text-white mb-7"
          style={{
            fontSize: "clamp(42px, 6vw, 80px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          Aprendemos IA
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, var(--indigo) 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            en serio
          </span>
          <br />
          y sin humo
        </h1>

        <p
          className="fade-up hero-sub-anim font-body mb-12"
          style={{
            fontSize: "18px",
            fontWeight: 300,
            color: "var(--muted)",
            maxWidth: "520px",
            lineHeight: 1.7,
          }}
        >
          Una comunidad de estudiantes y graduados de carreras de IA. Organizamos
          eventos, compartimos recursos realmente útiles y <strong>nos enseñamos entre nosotros lo que las aulas no llegaron a darnos.</strong>
        </p>

        <div className="fade-up hero-actions-anim flex flex-wrap items-center gap-4">
          <a href="#unirse" className="btn-primary">
            Unirme a la comunidad
          </a>
          <a href="#eventos" className="btn-ghost">
            Ver próximos eventos
          </a>
        </div>
      </div>
    </section>
  );
}
