"use client";

import { useEffect, useRef, useState, ElementType } from "react";

const DECODE_CYCLE_MS = 40000;
const DECODE_BASE_DELAY_MS = 3000;

interface CharTitleProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  as?: ElementType;
  lineDelay?: number;
  charStagger?: number;
  threshold?: number;
}

export default function CharTitle({
  children,
  className = "",
  style,
  as: Tag = "h2",
  lineDelay = 0,
  charStagger = 25,
  threshold = 0.1,
}: CharTitleProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);
  const [decodeStaggers, setDecodeStaggers] = useState<(number | null)[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTriggered(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    const total = Array.from(children).length;
    setDecodeStaggers(
      Array.from(
        { length: total },
        () => DECODE_BASE_DELAY_MS + Math.random() * (DECODE_CYCLE_MS - DECODE_BASE_DELAY_MS),
      ),
    );
  }, [children]);

  const combinedStyle: React.CSSProperties = {
    ...style,
    ["--line-delay" as string]: `${lineDelay}ms`,
  };

  const tokens = children.match(/\S+|\s/g) ?? [];
  let charIndex = 0;

  const renderWord = (word: string, key: number) => {
    const chars = Array.from(word).map((ch, ci) => {
      const idx = charIndex++;
      const decodeStagger = decodeStaggers[idx] ?? null;
      return (
        <span
          key={ci}
          className="char-wrap"
          style={{
            ["--char-delay" as string]: `${idx * charStagger}ms`,
            ...(decodeStagger != null
              ? { ["--decode-stagger" as string]: `${decodeStagger}ms` }
              : {}),
          }}
        >
          <span className="char-layer char-glitch" aria-hidden="true">
            {ch}
          </span>
          <span className="char-layer char-smooth">{ch}</span>
          {decodeStagger != null && (
            <span className="char-layer char-decode char-decode--sparse" aria-hidden="true">
              {ch}
            </span>
          )}
        </span>
      );
    });
    return (
      <span key={key} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {chars}
      </span>
    );
  };

  return (
    <Tag
      ref={ref}
      aria-label={children}
      className={`${className} ${triggered ? "is-revealed" : "deferred"}`.trim()}
      style={combinedStyle}
    >
      <span aria-hidden="true">
        {tokens.map((token, i) => {
          if (token.match(/\s/)) {
            charIndex += token.length;
            return token;
          }
          return renderWord(token, i);
        })}
      </span>
    </Tag>
  );
}
