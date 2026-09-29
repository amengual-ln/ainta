export const PORTRAIT_GLYPHS = [
  "·",
  ":",
  "+",
  "×",
  "#",
  "{",
  "}",
  "<",
  ">",
  "0",
  "1",
] as const;

function ellipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  const distance = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
  return Math.max(0, 1 - distance);
}

export function glyphHash(x: number, y: number, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

export function portraitDensity(x: number, y: number) {
  const head = ellipse(x, y, 0.51, 0.42, 0.265, 0.34);
  const hair = Math.max(
    ellipse(x, y, 0.47, 0.2, 0.31, 0.19),
    ellipse(x, y, 0.3, 0.37, 0.12, 0.27),
  );
  const neck = ellipse(x, y, 0.52, 0.72, 0.13, 0.2);
  const shoulders = ellipse(x, y, 0.52, 0.98, 0.49, 0.3);

  const leftEye = ellipse(x, y, 0.42, 0.4, 0.075, 0.018);
  const rightEye = ellipse(x, y, 0.61, 0.4, 0.075, 0.018);
  const nose = ellipse(x, y, 0.535, 0.52, 0.025, 0.13);
  const mouth = ellipse(x, y, 0.535, 0.61, 0.11, 0.018);
  const features = Math.max(leftEye, rightEye, nose * 0.72, mouth * 0.9);

  return Math.min(
    1,
    Math.max(head * 0.72, hair, neck * 0.52, shoulders * 0.58, features),
  );
}

export function glyphForCell(column: number, row: number, phase: number) {
  const stable = glyphHash(column, row);
  const changes = glyphHash(column, row, phase) > 0.9;
  const index = Math.floor(
    (changes ? glyphHash(column + phase, row, phase) : stable) *
      PORTRAIT_GLYPHS.length,
  );
  return PORTRAIT_GLYPHS[Math.min(index, PORTRAIT_GLYPHS.length - 1)];
}
