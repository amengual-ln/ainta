export default function Footer() {
  return (
    <footer
      className="relative z-10 flex flex-wrap items-center justify-between gap-4"
      style={{
        padding: "32px 40px",
        borderTop: "1px solid var(--border)",
      }}
    >
      <a
        href="/"
        className="font-display flex items-center gap-2 text-white"
        style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        <span className="logo-dot" />
        AINTA
      </a>
      <span className="text-[13px] text-muted">
        Hecho por estudiantes, para estudiantes · 2026
      </span>
    </footer>
  );
}
