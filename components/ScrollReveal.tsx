"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  as: Tag = "div",
  threshold = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const Component = Tag as React.ElementType;

  return (
    <Component ref={ref} className={`reveal ${className}`.trim()}>
      {children}
    </Component>
  );
}
