import Image from "next/image";
import PhosphorIcon from "./PhosphorIcon";

const socialLinks = [
  {
    href: "https://www.instagram.com/sparck.ai",
    label: "Instagram",
    icon: "InstagramLogo" as const,
  },
  {
    href: "https://www.linkedin.com/company/sparck-ai",
    label: "LinkedIn",
    icon: "LinkedinLogo" as const,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="site-footer relative z-10"
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

      <nav className="footer-socials" aria-label="Redes sociales">
        {socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PhosphorIcon name={link.icon} size={18} aria-hidden="true" />
            <span>{link.label}</span>
          </a>
        ))}
      </nav>

      <span
        className="footer-note"
        style={{
          fontSize: "13px",
          color: "var(--muted)",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          letterSpacing: "0.02em",
        }}
      >
        Hecho por y para estudiantes. {year}
      </span>
    </footer>
  );
}
