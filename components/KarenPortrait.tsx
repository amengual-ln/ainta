"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function KarenPortrait() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let visible = false;
    const update = () => el.classList.toggle("is-active", visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });

    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div ref={ref} className="karen-portrait-motion">
      <Image
        src="/portraits/karen-dither.png"
        alt="Ilustración de Karen Spärck Jones sonriendo, con dither en verde Spärck"
        width={720}
        height={900}
        className="karen-portrait-image"
        unoptimized
      />
    </div>
  );
}
