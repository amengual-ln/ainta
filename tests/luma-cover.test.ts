import assert from "node:assert/strict";
import test from "node:test";
import { extractLumaCover, fetchLumaCover } from "../lib/luma-cover.ts";

const cover = "https://images.lumacdn.com/uploads/event.png";
const htmlFor = (value: unknown) => `<script type="application/json" id="__NEXT_DATA__">${JSON.stringify({
  props: { pageProps: { initialData: { data: { event: { cover_url: value } } } } },
})}</script>`;
const originalFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = originalFetch; });

test("extrae la portada real y no confunde la imagen social con el flyer", () => {
  assert.equal(extractLumaCover(htmlFor(cover)), cover);
  for (const html of ["", '<script id="__NEXT_DATA__">{broken</script>',
    '<script id="__NEXT_DATA__">null</script>', htmlFor(null), htmlFor("not a URL"),
    '<meta property="og:image" content="https://images.lumacdn.com/event-social/example.png">']) {
    assert.equal(extractLumaCover(html), null);
  }
});

test("rechaza portadas fuera del CDN, HTTP, credenciales y puertos", () => {
  for (const url of ["https://images.lumacdn.com.evil.test/cover.png", "http://images.lumacdn.com/cover.png",
    "https://user:pass@images.lumacdn.com/cover.png", "https://images.lumacdn.com:8443/cover.png"]) {
    assert.equal(extractLumaCover(htmlFor(url)), null);
  }
});

test("no consulta enlaces ajenos a Luma ni URLs inseguras", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error("no debería consultar"); };
  for (const url of ["invalid", "https://example.com/event", "http://luma.com/event",
    "https://luma.com.evil.test/event", "https://user:pass@luma.com/event", "https://luma.com:8443/event"]) {
    assert.equal(await fetchLumaCover(url), null);
  }
  assert.equal(calls, 0);
});

test("sigue redirecciones dentro de Luma, limpia tracking y usa caché y timeout", async () => {
  const requested: string[] = [];
  globalThis.fetch = async (input, options) => {
    requested.push(String(input));
    assert.equal(options?.redirect, "manual");
    assert.ok(options?.signal);
    assert.equal((options as RequestInit & { next: { revalidate: number } }).next.revalidate, 3600);
    return requested.length === 1
      ? new Response(null, { status: 302, headers: { location: "https://luma.com/final" } })
      : new Response(htmlFor(cover), { headers: { "content-type": "text/html; charset=utf-8" } });
  };
  assert.equal(await fetchLumaCover("https://lu.ma/start?tracking=yes#section"), cover);
  assert.deepEqual(requested, ["https://lu.ma/start", "https://luma.com/final"]);
});

test("rechaza redirecciones externas y bucles sin hacer consultas inseguras", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 302, headers: { location: "https://evil.test/private" } });
  };
  assert.equal(await fetchLumaCover("https://luma.com/start"), null);
  assert.equal(calls, 1);
  calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 302, headers: { location: "/loop" } });
  };
  assert.equal(await fetchLumaCover("https://luma.com/start"), null);
  assert.equal(calls, 3);
});

test("falla sin romper la tarjeta ante HTTP, contenido incorrecto, timeout o cuerpo excesivo", async () => {
  for (const response of [new Response(null, { status: 404 }), new Response("image", {
    headers: { "content-type": "image/png" },
  }), new Response("x".repeat(2_000_001), { headers: { "content-type": "text/html" } }),
  new Response(null, { status: 302 })]) {
    globalThis.fetch = async () => response;
    assert.equal(await fetchLumaCover("https://luma.com/start"), null);
  }
  globalThis.fetch = async () => { throw new Error("timeout"); };
  assert.equal(await fetchLumaCover("https://luma.com/start"), null);
});
