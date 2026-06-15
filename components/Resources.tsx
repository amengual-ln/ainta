import ScrollReveal from "./ScrollReveal";
import CharTitle from "./CharTitle";
import { resourceCategories } from "@/lib/resources";

export default function Resources() {
  return (
    <section
      id="recursos"
      className="relative z-10"
      style={{ padding: "80px 0 120px" }}
    >
      <ScrollReveal className="mb-12" threshold={0.1}>
        <CharTitle
          className="font-display text-white"
          style={{
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          Recursos curados por la comunidad
        </CharTitle>
      </ScrollReveal>

      <ScrollReveal as="div" threshold={0.08}>
        <div
          className="grid grid-cols-1 md:grid-cols-2 overflow-hidden"
          style={{
            gap: "2px",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          {resourceCategories.map((cat) => (
            <a
              key={cat.title}
              href="/recursos"
              className="hover-card no-accent"
              style={{
                background: "var(--card-bg)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                padding: "32px",
                display: "block",
                minHeight: "200px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent-soft)",
                  marginBottom: "12px",
                }}
              >
                {cat.category}
              </div>
              <div
                className="font-display text-white"
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  marginBottom: "10px",
                }}
              >
                {cat.title}
              </div>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "var(--muted)",
                }}
              >
                {cat.description}
              </p>
            </a>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
