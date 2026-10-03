import assert from "node:assert/strict";
import test from "node:test";
import {
  glyphForCell,
  glyphHash,
  portraitDensity,
  portraitParticleDensity,
} from "../lib/glyph-portrait.ts";

test("glyph portrait keeps a deterministic human silhouette", () => {
  assert.equal(glyphHash(4, 7, 2), glyphHash(4, 7, 2));
  assert.ok(portraitDensity(0.5, 0.4) > 0.5);
  assert.ok(portraitDensity(0.5, 0.84) > 0.15);
  assert.equal(portraitDensity(0.5, 0.99), 0);
  assert.equal(portraitDensity(0.02, 0.02), 0);
  assert.ok(portraitParticleDensity(0.18, 0.42) > 0);
  assert.equal(glyphForCell(8, 12, 3).length, 1);
});
