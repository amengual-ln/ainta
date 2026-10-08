import Image from "next/image";
import Link from "next/link";
import PhosphorIcon from "./PhosphorIcon";

const siteLinks = [
  { href: "/eventos", label: "Eventos" },
  { href: "/recursos", label: "Recursos" },
  { href: "/#origen", label: "Por qué Spärck" },
  { href: "/#unirse", label: "Sumate" },
];

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
  {
    href: "https://chat.whatsapp.com/FzOeQXKbnOrGfrVlgb41k1",
    label: "Grupo de WhatsApp",
    icon: "WhatsappLogo" as const,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer relative z-10">
      <div className="site-shell site-footer-grid">
        <p className="footer-motto">
          La chispa que conecta<br />el conocimiento.
        </p>

        <nav className="footer-column" aria-label="Secciones">
          {siteLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>

        <nav className="footer-column" aria-label="Redes sociales">
          {socialLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              <PhosphorIcon name={link.icon} size={17} aria-hidden="true" />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="site-shell footer-bottom">
        <Link href="/" aria-label="Spärck, inicio" className="footer-brand">
          <Image src="/favicon.png" alt="" width={22} height={22} aria-hidden="true" />
          Spärck
        </Link>
        <span>Comunidad de estudiantes de IA y datos · Argentina · {year}</span>
      </div>
    </footer>
  );
}
