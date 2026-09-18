import assert from "node:assert/strict";
import test from "node:test";
import {
  manualEmailHtml,
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
