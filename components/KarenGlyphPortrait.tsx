"use client";

import { useEffect, useRef } from "react";
import {
  glyphForCell,
  glyphHash,
  portraitDensity,
} from "@/lib/glyph-portrait";

const FRAME_INTERVAL_MS = 140;

export default function KarenGlyphPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousFrame = -FRAME_INTERVAL_MS;

    const draw = (time = 0) => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(width * ratio);
      const pixelHeight = Math.round(height * ratio);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      const cell = Math.max(8, Math.min(12, width / 42));
      const columns = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const phase = reduceMotion.matches ? 0 : Math.floor(time / 920);

      context.font = `${cell * 0.9}px var(--font-geist-mono), monospace`;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = (column + 0.5) / columns;
          const y = (row + 0.5) / rows;
          const density = portraitDensity(x, y);
          const fragment = glyphHash(column, row, phase) > 0.992;

          if (density <= 0.025 && !fragment) continue;

          const flicker = glyphHash(column, row, phase + 3);
          const alpha = fragment
            ? 0.16
            : Math.min(0.9, 0.12 + density * 0.78 + flicker * 0.08);
          const accent =
            density > 0.7 && glyphHash(column, row, 4) > 0.72;
          const scanShift =
            !reduceMotion.matches && row % 17 === phase % 17 ? 3 : 0;

          context.fillStyle = accent
            ? `rgba(93, 201, 168, ${alpha})`
            : `rgba(240, 240, 245, ${alpha})`;
          context.fillText(
            glyphForCell(column, row, phase),
            column * cell + cell / 2 + scanShift,
            row * cell + cell / 2,
          );
        }
      }
    };

    const animate = (time: number) => {
      if (time - previousFrame >= FRAME_INTERVAL_MS) {
        draw(time);
        previousFrame = time;
      }
      if (!reduceMotion.matches) frame = requestAnimationFrame(animate);
    };

    const restart = () => {
      cancelAnimationFrame(frame);
      draw();
      if (!reduceMotion.matches) frame = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(restart);
    observer.observe(canvas);
    reduceMotion.addEventListener("change", restart);
    restart();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduceMotion.removeEventListener("change", restart);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="origin-glyph-canvas"
      role="img"
      aria-label="Retrato abstracto de Karen Spärck Jones construido con glifos variables"
    />
  );
}
