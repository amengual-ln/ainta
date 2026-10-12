import assert from "node:assert/strict";
import test from "node:test";
import {
  manualEmailHtml,
  manualEmailText,
  validateManualEmailPayload,
} from "../lib/manual-email.ts";

test("validates and normalizes a manual reply", () => {
  const result = validateManualEmailPayload({
    to: "Persona@Example.com, persona@example.com",
    cc: "equipo@example.com, persona@example.com",
    bcc: "equipo@example.com, privada@example.com",
    subject: "Re: Consulta",
    body: "Hola,\n\nGracias por escribir.",
    inReplyTo: "<message-123@example.com>",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value.to, ["persona@example.com"]);
  assert.deepEqual(result.value.cc, ["equipo@example.com"]);
  assert.deepEqual(result.value.bcc, ["privada@example.com"]);
  assert.equal(result.value.inReplyTo, "<message-123@example.com>");
});

test("rejects header injection and escapes message HTML", () => {
  const result = validateManualEmailPayload({
    to: "persona@example.com",
    subject: "Hola\r\nBcc: attacker@example.com",
    body: "Mensaje",
  });

  assert.equal(result.ok, false);
  assert.match(manualEmailHtml("<script>alert('x')</script>"), /&lt;script&gt;/);
});

test("adds the Spärck signature to HTML and plain-text emails", () => {
  const html = manualEmailHtml("Hola");
  const text = manualEmailText("Hola");

  assert.match(html, /favicon\.png/);
  assert.match(html, />Spärck</);
  assert.match(html, />Instagram</);
  assert.match(html, />LinkedIn</);
  assert.match(text, /sparck\.com\.ar/);
  assert.match(text, /Instagram:/);
  assert.match(text, /LinkedIn:/);
});

test("rejects invalid recipients, message IDs, and recipient overflow", () => {
  const base = {
    to: "persona@example.com",
    subject: "Consulta",
    body: "Mensaje",
  };

  assert.equal(validateManualEmailPayload({ ...base, to: "sin-arroba" }).ok, false);
  assert.equal(
    validateManualEmailPayload({ ...base, inReplyTo: "mensaje@example.com" }).ok,
    false
  );
  assert.equal(
    validateManualEmailPayload({
      ...base,
      to: Array.from({ length: 21 }, (_, index) => `persona${index}@example.com`).join(","),
    }).ok,
    false
  );
});
