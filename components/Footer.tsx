import Image from "next/image";
import Link from "next/link";
import PhosphorIcon from "./PhosphorIcon";

const socialLinks = [
  { href: "https://www.instagram.com/sparck.ai", label: "Instagram", icon: "InstagramLogo" as const },
  { href: "https://www.linkedin.com/company/sparck-ai", label: "LinkedIn", icon: "LinkedinLogo" as const },
];

export default function Footer() {
  return (
    <footer className="site-footer relative z-10">
      <div className="site-shell footer-layout">
        <Link href="/" aria-label="Spärck, inicio">
          <Image src="/favicon.png" alt="" width={24} height={24} aria-hidden="true" />
        </Link>
        <nav className="footer-socials" aria-label="Redes sociales">
          {socialLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              <PhosphorIcon name={link.icon} size={18} aria-hidden="true" />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
        <span className="footer-note">Hecho por y para estudiantes. {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
