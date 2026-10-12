"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WORDMARK = Array.from("Spärck");
const LINE_DELAY_MS = 350;
const CHAR_STAGGER_MS = 30;
const DECODE_CYCLE_MS = 20000;
const DECODE_BASE_DELAY_MS = 3000;

function renderWordmark(decodeStaggers: (number | null)[]) {
  return (
    <span
      className="h1-reveal block"
      style={{
        ["--line-delay" as string]: `${LINE_DELAY_MS}ms`,
        whiteSpace: "nowrap",
      }}
    >
      {WORDMARK.map((ch, ci) => {
        const decodeStagger = decodeStaggers[ci];
        return (
          <span
            key={ci}
            className="char-wrap"
            style={{
              ["--char-delay" as string]: `${ci * CHAR_STAGGER_MS}ms`,
              ...(decodeStagger != null
                ? { ["--decode-stagger" as string]: `${decodeStagger}ms` }
                : {}),
            }}
          >
            <span className="char-layer char-glitch" aria-hidden="true">
              {ch}
            </span>
            <span className="char-layer char-smooth">
              {ch}
            </span>
            {decodeStagger != null && (
              <span className="char-layer char-decode" aria-hidden="true">
                {ch}
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
    setDecodeStaggers(
      Array.from(
        { length: WORDMARK.length },
        () => DECODE_BASE_DELAY_MS + Math.random() * (DECODE_CYCLE_MS - DECODE_BASE_DELAY_MS),
      ),
    );
  }, []);

  return (
    <section
      className="community-hero relative z-10"
    >
      <div>
        <div className="hero-mark-wrap mb-7">
          <Image
            src="/favicon.png"
            alt=""
            aria-hidden="true"
            width={80}
            height={80}
            className="hero-mark shrink-0 fade-up"
            style={{
              width: "clamp(64px, 12vw, 102px)",
              height: "clamp(64px, 12vw, 102px)",
              animationDelay: "0.35s",
            }}
          />
          <h1
            aria-label="Spärck"
            className="text-white"
            style={{
              fontFamily: "var(--font-open-sauce), sans-serif",
              fontWeight: "var(--font-open-sauce-weight, 400)",
              fontSize: "clamp(42px, 6vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            <span aria-hidden="true">
              {renderWordmark(decodeStaggers)}
            </span>
          </h1>
        </div>

        <p
          className="fade-up hero-slogan-anim"
          style={{
            marginBottom: "14px",
            color: "var(--accent-soft)",
            fontSize: "clamp(14px, 2vw, 16px)",
            letterSpacing: "0.025em",
            lineHeight: 1.45,
          }}
        >
          LA CHISPA QUE CONECTA EL CONOCIMIENTO
        </p>

        <p
          className="fade-up hero-sub-anim mb-10"
          style={{
            fontSize: "18px",
            fontWeight: 300,
            color: "var(--muted)",
            maxWidth: "520px",
            lineHeight: 1.7,
          }}
        >
          Comunidad abierta de estudiantes y graduados en carreras de IA.
          Aprendemos haciendo, compartimos sin filtro y construimos en
          comunidad.
        </p>

        <div id="eventos" className="fade-up hero-actions-anim flex flex-wrap items-center gap-4">
          <Link href="/eventos" className="btn-primary">
            Explorar eventos
          </Link>
        </div>

        <div className="hero-partners">
          <span className="hero-partners-label">Acompañamos como comunidad a</span>
          <a
            href="https://nerdearla.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-partner-link"
            aria-label="Visitar el sitio de Nerdearla"
          >
            <Image
              src="/partners/nerdearla.png"
              alt=""
              width={900}
              height={122}
              className="partner-logo partner-logo-nerdearla"
            />
          </a>
          <a
            href="https://argentina.campus-party.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-partner-link"
            aria-label="Visitar el sitio de Campus Party Argentina"
          >
            <Image
              src="/partners/campus-party.png"
              alt=""
              width={600}
              height={209}
              className="partner-logo partner-logo-campus-party"
            />
          </a>
        </div>
      </div>

    </section>
  );
}
