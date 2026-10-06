import assert from "node:assert/strict";
import test from "node:test";
import {
  glyphHash,
  idleHeadPose,
  glyphIndexForCell,
  PORTRAIT_GLYPHS,
  portraitDensity,
  portraitDepth,
  portraitNormal,
  portraitParticleDensity,
} from "../lib/glyph-portrait.ts";

test("glyph portrait follows Karen's photo", () => {
  assert.equal(glyphHash(4, 7, 2), glyphHash(4, 7, 2));
  assert.ok(portraitDensity(0.5, 0.4) > 0.3);
  assert.ok(portraitDensity(0.5, 0.84) > 0.3);
  assert.equal(portraitDensity(0.5, 0.99), 0);
  assert.equal(portraitDensity(0.02, 0.02), 0);
  assert.equal(portraitDensity(0.95, 0.05), 0);
  assert.equal(portraitDensity(-0.1, 1.2), 0);
  assert.ok(portraitParticleDensity(0.3, 0.5) > 0);
  assert.ok(PORTRAIT_GLYPHS[glyphIndexForCell(8, 12, 3)]);
  assert.ok(glyphIndexForCell(8, 12, 3, 1) > glyphIndexForCell(8, 12, 3, 0));
});

test("glyph portrait has a rounded relief", () => {
  assert.ok(portraitDepth(0.45, 0.45) > portraitDepth(0.15, 0.45));
  assert.equal(portraitDepth(0.02, 0.02), 0);
  const [nx, ny, nz] = portraitNormal(0.15, 0.4);
  assert.ok(Math.abs(Math.hypot(nx, ny, nz) - 1) < 1e-9);
  assert.ok(nx < 0);
});

test("head moves gently", () => {
  for (let seconds = 0; seconds < 120; seconds += 0.7) {
    const pose = idleHeadPose(seconds);
    assert.ok(Math.abs(pose.yaw) <= 0.05);
    assert.ok(Math.abs(pose.pitch) <= 0.026);
    assert.ok(Math.abs(pose.roll) <= 0.028);
  }
  const step = 1 / 60;
  const now = idleHeadPose(10);
  const next = idleHeadPose(10 + step);
  assert.ok(Math.abs(next.yaw - now.yaw) < 0.001);
});
