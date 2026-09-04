import Image from "next/image";
import Link from "next/link";
import PhosphorIcon from "./PhosphorIcon";

const links = [
  { href: "/eventos", label: "Eventos" },
  { href: "/recursos", label: "Recursos" },
  { href: "/#unirse", label: "Sumate" },
];

interface SiteHeaderProps {
  minimal?: boolean;
}

export default function SiteHeader({ minimal = false }: SiteHeaderProps) {
  return (
    <header className={`site-header${minimal ? " site-header-minimal" : ""}`}>
      <div className="site-shell site-header-inner">
        {!minimal && (
          <Link href="/" className="site-brand" aria-label="Spärck, inicio">
            <Image src="/favicon.png" alt="" width={30} height={30} aria-hidden="true" />
            <span>Spärck</span>
          </Link>
        )}

        <nav className="site-nav-desktop" aria-label="Navegación principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <details className="site-nav-mobile">
          <summary aria-label="Abrir navegación">
            <PhosphorIcon name="List" size={22} aria-hidden="true" />
          </summary>
          <nav aria-label="Navegación móvil">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
