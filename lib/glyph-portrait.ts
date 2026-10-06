import {
  KAREN_DENSITY,
  KAREN_DENSITY_HEIGHT,
  KAREN_DENSITY_WIDTH,
  KAREN_DEPTH,
} from "./karen-density.ts";

// Ordenados de más liviano a más pesado: el brillo elige el glifo.
export const PORTRAIT_GLYPHS = [
  "·",
  ":",
  "+",
  "×",
  "<",
  ">",
  "1",
  "{",
  "}",
  "0",
  "#",
] as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function glyphHash(x: number, y: number, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function sampleGrid(grid: string, x: number, y: number) {
  const column = Math.floor(x * KAREN_DENSITY_WIDTH);
  const row = Math.floor(y * KAREN_DENSITY_HEIGHT);
  if (
    column < 0 || column >= KAREN_DENSITY_WIDTH ||
    row < 0 || row >= KAREN_DENSITY_HEIGHT
  ) {
    return 0;
  }
  return parseInt(grid[row * KAREN_DENSITY_WIDTH + column], 16) / 15;
}

export function portraitDensity(x: number, y: number) {
  const edgeNoise = glyphHash(Math.round(x * 83), Math.round(y * 89), 8);
  const lowerEdge = 0.93 + edgeNoise * 0.06;
  const lowerFade = y <= 0.8 ? 1 : clamp((lowerEdge - y) / (lowerEdge - 0.8));
  const sideFade = clamp(Math.min(x, 1 - x) / 0.06);

  return sampleGrid(KAREN_DENSITY, x, y) * lowerFade * sideFade;
}

// Partículas sueltas en un halo alrededor de la silueta.
export function portraitParticleDensity(x: number, y: number) {
  const radius = 0.05;
  let halo = 0;
  for (let step = 0; step < 8; step += 1) {
    const angle = (step / 8) * Math.PI * 2;
    halo += portraitDensity(
      x + Math.cos(angle) * radius,
      y + Math.sin(angle) * radius * 0.8,
    );
  }
  const canvasFade = clamp(Math.min(x, 1 - x) / 0.055) *
    clamp(Math.min(y, 1 - y) / 0.065);

  return clamp(halo / 8 - portraitDensity(x, y)) * canvasFade;
}

// Profundidad de 0 (fondo) a 1 (lo más cercano), suavizada entre celdas.
export function portraitDepth(x: number, y: number) {
  const step = 1 / KAREN_DENSITY_WIDTH;
  return (
    sampleGrid(KAREN_DEPTH, x, y) * 2 +
    sampleGrid(KAREN_DEPTH, x - step, y) +
    sampleGrid(KAREN_DEPTH, x + step, y) +
    sampleGrid(KAREN_DEPTH, x, y - step) +
    sampleGrid(KAREN_DEPTH, x, y + step)
  ) / 6;
}

export type Vec3 = [number, number, number];

// Normal de la superficie (vector unitario que mira hacia afuera).
export function portraitNormal(x: number, y: number): Vec3 {
  const step = 2 / KAREN_DENSITY_WIDTH;
  const dx = portraitDepth(x + step, y) - portraitDepth(x - step, y);
  const dy = portraitDepth(x, y + step) - portraitDepth(x, y - step);
  const nx = -dx * 6;
  const ny = -dy * 6;
  const length = Math.hypot(nx, ny, 1);
  return [nx / length, ny / length, 1 / length];
}

export function glyphIndexForCell(
  column: number,
  row: number,
  phase: number,
  density = glyphHash(column, row),
) {
  const changes = glyphHash(column, row, phase) > 0.9;
  const jitter = (glyphHash(changes ? column + phase : column, row, phase) - 0.5) *
    (changes ? 4 : 2);
  const index = Math.round(density * (PORTRAIT_GLYPHS.length - 1) + jitter);
  return clamp(index, 0, PORTRAIT_GLYPHS.length - 1);
}

// ── Movimientos de cabeza ──

// Balanceo lento y chico, mezclando ritmos que no se repiten igual.
export function idleHeadPose(seconds: number) {
  const t = seconds;
  return {
    yaw: Math.sin(t * 0.31) * 0.035 + Math.sin(t * 0.73 + 1.3) * 0.015,
    pitch: Math.sin(t * 0.23 + 0.5) * 0.018 + Math.sin(t * 0.59) * 0.008,
    roll: Math.sin(t * 0.19 + 2) * 0.02 + Math.sin(t * 0.47) * 0.008,
  };
}
