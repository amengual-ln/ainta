"use client";

import { useEffect, useRef, useState, ElementType } from "react";

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

  const chars = Array.from(children).map((ch, i) => ({
    ch: ch === " " ? "\u00A0" : ch,
    charDelay: i * charStagger,
  }));

  const combinedStyle: React.CSSProperties = {
    ...style,
    ["--line-delay" as string]: `${lineDelay}ms`,
  };

  return (
    <Tag
      ref={ref}
      className={`${className} ${triggered ? "is-revealed" : "deferred"}`.trim()}
      style={combinedStyle}
    >
      {chars.map((c, ci) => (
        <span
          key={ci}
          className="char-wrap"
          style={{ ["--char-delay" as string]: `${c.charDelay}ms` }}
        >
          <span className="char-layer char-glitch" aria-hidden="true">
            {c.ch}
          </span>
          <span className="char-layer char-smooth">{c.ch}</span>
        </span>
      ))}
    </Tag>
  );
}
