import Link from "next/link";

export default function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-[padding] duration-300"
      style={{ padding: "28px 40px" }}
    >
      <Link href="/" className="text-2xl flex items-center gap-2 font-display text-[18px] font-semibold tracking-[-0.02em] text-white">
        <span className="logo-dot" />
        AINTA
      </Link>

      <ul className="hidden md:flex gap-8 list-none">
        <li>
          <a href="#pilares" className="text-[14px] text-muted transition-colors hover:text-white">
            Pilares
          </a>
        </li>
        <li>
          <a href="#eventos" className="text-[14px] text-muted transition-colors hover:text-white">
            Eventos
          </a>
        </li>
        <li>
          <a href="#recursos" className="text-[14px] text-muted transition-colors hover:text-white">
            Recursos
          </a>
        </li>
      </ul>

      <a
        href="#unirse"
        className="font-display text-[13px] font-medium tracking-[0.01em] px-5 py-2.5 rounded-lg transition-all duration-200"
        style={{
          background: "var(--indigo-dim)",
          border: "1px solid rgba(99,102,241,0.4)",
          color: "var(--indigo-soft)",
        }}
      >
        Unirse →
      </a>
    </nav>
  );
}
