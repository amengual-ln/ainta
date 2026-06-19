"use client";

import { useEffect, useState } from "react";

const H1_LINES: string[] = ["AINTA", "", ""];

const LINE_DELAYS = [350, 550, 750] as const;
const CHAR_STAGGER_MS = 30;
const DECODE_CYCLE_MS = 20000;
const DECODE_BASE_DELAY_MS = 3000;

function splitChars(line: string): string[] {
  const out: string[] = [];
  for (const ch of line) {
    out.push(ch === " " ? "\u00A0" : ch);
  }
  return out;
}

const LINES = H1_LINES.map((line, li) => ({
  text: line,
  delay: LINE_DELAYS[li],
  chars: splitChars(line).map((ch, ci) => ({
    ch,
    charDelay: ci * CHAR_STAGGER_MS,
  })),
}));

function renderLine(
  lineIdx: number,
  gradientOn: boolean,
  decodeStaggers: (number | null)[],
  charOffset: number,
) {
  const line = LINES[lineIdx];
  return (
    <span
      key={lineIdx}
      className="h1-reveal block"
      style={{ ["--line-delay" as string]: `${line.delay}ms` }}
    >
      {line.chars.map((c, ci) => {
        const visibleChar = c.ch === "\u00A0" ? "\u00A0" : c.ch;
        const decodeStagger = decodeStaggers[charOffset + ci];
        return (
          <span
            key={ci}
            className="char-wrap"
            style={{
              ["--char-delay" as string]: `${c.charDelay}ms`,
              ...(decodeStagger != null
                ? { ["--decode-stagger" as string]: `${decodeStagger}ms` }
                : {}),
            }}
            aria-hidden={c.ch === "\u00A0" ? undefined : undefined}
          >
            <span className="char-layer char-glitch" aria-hidden="true">
              {visibleChar}
            </span>
            <span
              className={
                gradientOn
                  ? "char-layer char-smooth h1-gradient"
                  : "char-layer char-smooth"
              }
            >
              {visibleChar}
            </span>
            {decodeStagger != null && (
              <span className="char-layer char-decode" aria-hidden="true">
                {visibleChar}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export default function Hero() {
  const [decodeStaggers, setDecodeStaggers] = useState<(number | null)[]>([]);

  useEffect(() => {
    const totalChars = LINES.reduce((acc, l) => acc + l.chars.length, 0);
    setDecodeStaggers(
      Array.from(
        { length: totalChars },
        () => DECODE_BASE_DELAY_MS + Math.random() * (DECODE_CYCLE_MS - DECODE_BASE_DELAY_MS),
      ),
    );
  }, []);

  let charOffset = 0;
  const line0Offset = 0;
  charOffset = LINES[0].chars.length;
  const line1Offset = charOffset;
  charOffset += LINES[1].chars.length;
  const line2Offset = charOffset;

  return (
    <section
      className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-12"
      style={{ minHeight: "100dvh", paddingTop: "80px", paddingBottom: "80px" }}
    >
      <div className="lg:col-span-7">
        <div
          className="fade-up eyebrow-anim inline-flex items-center gap-2 mb-8"
          style={{
            fontSize: "12px",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent-soft)",
          }}
        >
          <span className="eyebrow-line" />
          COMUNIDAD DE ESTUDIANTES Y GRADUADOS DE CARRERAS DE IA
        </div>

        <h1
          className="font-display text-white mb-7"
          style={{
            fontSize: "clamp(42px, 6vw, 80px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          {renderLine(0, false, decodeStaggers, line0Offset)}
          {renderLine(1, true, decodeStaggers, line1Offset)}
          {renderLine(2, false, decodeStaggers, line2Offset)}
        </h1>

        <p
          className="fade-up hero-sub-anim mb-12"
          style={{
            fontSize: "18px",
            fontWeight: 300,
            color: "var(--muted)",
            maxWidth: "520px",
            lineHeight: 1.7,
          }}
        >
          Un espacio donde se aprende haciendo, se
          comparte sin filtro y se construye en comunidad.
        </p>

        <div className="fade-up hero-actions-anim flex flex-wrap items-center gap-4">
          <a href="#unirse" className="btn-primary">
            Sumate
          </a>
          <a href="#eventos" className="btn-ghost">
            Mirá los próximos eventos
          </a>
        </div>
      </div>

      <aside
        className="fade-up hero-aside-anim hidden lg:flex lg:col-span-5 items-end justify-end"
        style={{ minHeight: "400px" }}
        aria-hidden="true"
      >
        {/*
          TODO[hero-side-asset]: motion abstracto en loop (dirección A2
          — kinetic typography con Geist Pixel → Geist Sans). Cuando se
          implemente, este slot reemplaza el comentario con el componente.
          Por ahora queda vacío (no rellenar con div-fake).
          Spec objetivo: ~480x520, abstracción visual sin fake-screenshots.
        */}
      </aside>
    </section>
  );
}
