import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative z-10 flex flex-wrap items-center justify-between gap-4"
      style={{
        padding: "32px 40px",
        borderTop: "1px solid var(--border)",
      }}
    >
      <a href="/" aria-label="Spärck" className="shrink-0">
        <Image
          src="/logo-sparck-white.png"
          alt=""
          aria-hidden="true"
          width={192}
          height={108}
          className="footer-logo"
        />
      </a>
      <span
        style={{
          fontSize: "13px",
          color: "var(--muted)",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          letterSpacing: "0.02em",
        }}
      >
        Hecho por estudiantes, para estudiantes · {year}
      </span>
    </footer>
  );
}
