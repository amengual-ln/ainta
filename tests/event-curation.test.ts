import assert from "node:assert/strict";
import test from "node:test";
import {
  curateEventWithGroq,
  extractEventDescription,
  fetchEventDescription,
  isAllowedEventUrl,
  validateCurationResult,
} from "../lib/event-curation.ts";

const originalFetch = globalThis.fetch;
const originalGroqApiKey = process.env.GROQ_API_KEY;
const originalGroqModel = process.env.GROQ_MODEL;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalGroqApiKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqApiKey;
  if (originalGroqModel === undefined) delete process.env.GROQ_MODEL;
  else process.env.GROQ_MODEL = originalGroqModel;
});

test("extracts and cleans an Event JSON-LD description", () => {
  const html = `
    <html><head>
      <meta name="description" content="Fallback">
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"Event","description":"Aprendé <strong>IA</strong> &amp; datos con casos reales."}
      </script>
    </head></html>
  `;

  assert.equal(
    extractEventDescription(html),
    "Aprendé IA & datos con casos reales."
  );
});

test("falls back from malformed JSON-LD to metadata and body text", () => {
  assert.equal(
    extractEventDescription(`
      <html><head>
        <script type="application/ld+json">{invalid</script>
        <meta property="og:description" content="Datos &#38; IA">
      </head></html>
    `),
    "Datos & IA"
  );
  assert.equal(
    extractEventDescription("<body><style>hidden</style>Encuentro <b>técnico</b></body>"),
    "Encuentro técnico"
  );
});

test("only accepts HTTPS URLs for the expected event provider", () => {
  assert.equal(isAllowedEventUrl("https://lu.ma/example", "luma"), true);
  assert.equal(
    isAllowedEventUrl("https://events.eventbrite.com/example", "eventbrite"),
    true
  );
  assert.equal(
    isAllowedEventUrl("https://www.eventbrite.com.ar/e/example", "eventbrite"),
    true
  );
  assert.equal(isAllowedEventUrl("http://lu.ma/example", "luma"), false);
  assert.equal(isAllowedEventUrl("https://lu.ma.evil.test/example", "luma"), false);
  assert.equal(isAllowedEventUrl("https://example.com", "meetup"), false);
  assert.equal(isAllowedEventUrl("not a URL", "meetup"), false);
});

test("fetches an allowed event page after a safe redirect", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(null, {
        status: 302,
        headers: { location: "https://lu.ma/final" },
      });
    }
    return new Response('<meta name="description" content="Taller de agentes">', {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };

  assert.equal(
    await fetchEventDescription("https://lu.ma/start", "luma"),
    "Taller de agentes"
  );
  assert.equal(calls, 2);
  await assert.rejects(
    fetchEventDescription("https://example.com/event", "luma"),
    /unsupported luma URL/
  );
});

test("validates Groq results and removes a discarded summary", () => {
  const result = validateCurationResult(
    {
      result: {
        score: 18,
        decision: "descartar",
        reason: "No tiene relación sustancial con IA o datos.",
        summary: "Este texto no debe conservarse.",
        tags: ["Networking", "Networking"],
      },
    },
    "event-1"
  );

  assert.equal(result.id, "event-1");
  assert.equal(result.summary, "");
  assert.deepEqual(result.tags, []);
  assert.throws(
    () =>
      validateCurationResult(
        {
          result: {
            score: 90,
            decision: "descartar",
            reason: "Inconsistente.",
            summary: "",
            tags: [],
          },
        },
        "event-1"
      ),
    /inconsistent decision/
  );
});

test("rejects malformed curation fields and accepts the review range", () => {
  const validResult = {
    score: 55,
    decision: "revisar",
    reason: "La propuesta es relevante pero faltan detalles.",
    summary: "Una propuesta técnica para revisar antes de publicar.",
    tags: ["Charla"],
  };

  assert.equal(
    validateCurationResult({ result: validResult }, "event-review").decision,
    "revisar"
  );

  const invalidCases: Array<[unknown, RegExp]> = [
    [null, /invalid result envelope/],
    [{ result: { ...validResult, score: -1 } }, /invalid score/],
    [{ result: { ...validResult, decision: "publicar" } }, /invalid decision/],
    [{ result: { ...validResult, reason: null } }, /invalid text fields/],
    [{ result: { ...validResult, tags: ["Destacado"] } }, /unsupported tag/],
    [{ result: { ...validResult, reason: "" } }, /omitted required editorial text/],
    [{ result: { ...validResult, summary: "" } }, /omitted required editorial text/],
  ];

  for (const [value, message] of invalidCases) {
    assert.throws(() => validateCurationResult(value, "event-review"), message);
  }
});

test("calls Groq with structured output and preserves the local event id", async () => {
  process.env.GROQ_API_KEY = "test-key";
  delete process.env.GROQ_MODEL;
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.method, "POST");
    assert.match(String(init?.headers && JSON.stringify(init.headers)), /test-key/);
    const request = JSON.parse(String(init?.body));
    assert.equal(request.model, "qwen/qwen3.8-27b");
    assert.equal(request.response_format.type, "json_schema");
    assert.equal(JSON.parse(request.messages[1].content).id, undefined);

    return Response.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              result: {
                score: 82,
                decision: "recomendar",
                reason: "Contenido técnico práctico.",
                summary: "Un encuentro práctico sobre IA y automatización.",
                tags: ["Taller", "Taller"],
              },
            }),
          },
        },
      ],
    });
  };

  const result = await curateEventWithGroq({
    id: "notion-page-id",
    title: "Agentes en producción",
    source: "luma",
    url: "https://lu.ma/agents",
    startAt: "2026-10-20T18:00:00-03:00",
    modality: "Presencial",
    location: "Buenos Aires",
    cost: "Gratis",
    description: "Una descripción del evento.",
  });

  assert.equal(result.id, "notion-page-id");
  assert.deepEqual(result.tags, ["Taller"]);
});

test("rejects missing credentials and malformed Groq responses", async () => {
  delete process.env.GROQ_API_KEY;
  await assert.rejects(
    curateEventWithGroq({
      id: "event-2",
      title: "Evento",
      source: "meetup",
      url: "https://meetup.com/event",
      startAt: "2026-10-20T18:00:00-03:00",
      modality: "",
      location: "",
      cost: "",
      description: "",
    }),
    /GROQ_API_KEY missing/
  );

  process.env.GROQ_API_KEY = "test-key";
  globalThis.fetch = async () => Response.json({ choices: [] });
  await assert.rejects(
    curateEventWithGroq({
      id: "event-2",
      title: "Evento",
      source: "meetup",
      url: "https://meetup.com/event",
      startAt: "2026-10-20T18:00:00-03:00",
      modality: "",
      location: "",
      cost: "",
      description: "",
    }),
    /Groq returned no content/
  );
});
