import ScrollReveal from "./ScrollReveal";
import { resourceCategories } from "@/lib/resources";

export default function Resources() {
  return (
    <section
      id="recursos"
      className="relative z-10"
      style={{ padding: "80px 0 120px" }}
    >
      <ScrollReveal className="mb-12" threshold={0.1}>
        <div
          className="font-body mb-4"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--indigo-soft)",
          }}
        >
          Biblioteca
        </div>
        <h2
          className="font-display text-white"
          style={{
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          Recursos curados por la comunidad
        </h2>
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
                padding: "32px",
                display: "block",
              }}
            >
              <div
                className="font-body mb-3"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--indigo-soft)",
                }}
              >
                {cat.category}
              </div>
              <div
                className="font-display text-white mb-2.5"
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {cat.title}
              </div>
              <p
                className="font-body text-muted"
                style={{ fontSize: "14px", lineHeight: 1.6 }}
              >
                {cat.description}
              </p>
              <div
                className="font-body flex items-center gap-1.5"
                style={{ marginTop: "20px", fontSize: "12px", color: "var(--muted)" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--indigo-soft)",
                  }}
                />
                {cat.count}
              </div>
            </a>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
