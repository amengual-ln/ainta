import assert from "node:assert/strict";
import test from "node:test";
import { extractLumaEvents, fetchLuma } from "../lib/sources/luma.ts";

const originalFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = originalFetch; });

const card = (id: string) => ({
  api_id: id,
  name: `Event ${id}`,
  url: `https://lu.ma/${id}`,
  start_at: "2026-12-02T19:00:00-03:00",
  location_type: "offline",
});

test("extracts events from city homepage and nested category listings", () => {
  assert.deepEqual(
    extractLumaEvents({ props: { pageProps: { initialData: { data: { events: [{ event: card("a") }] } } } } }),
    [card("a")]
  );
  assert.deepEqual(
    extractLumaEvents({ props: { pageProps: { initialData: { data: { sections: [{ cards: [{ event: card("b") }] }] } } } } }),
    [card("b")]
  );
  assert.deepEqual(
    extractLumaEvents({ props: { pageProps: { initialData: { data: { featured: [{ event: card("c") }] } } } } }),
    [card("c")]
  );
});

test("ignores irrelevant JSON nodes and terminates on cyclic objects", () => {
  const root: Record<string, unknown> = { other: { name: "Not an event", url: "/nope" } };
  root.self = root;
  assert.deepEqual(extractLumaEvents(root), []);
});

test("merges several Luma feeds and keeps processing after one fails", async () => {
  const payload = (data: unknown) =>
    `<html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(data)}</script></html>`;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/ai")) {
      return new Response(payload({ props: { pageProps: { other: { events: [{ event: card("new") }] } } } }), {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    }
    if (url.endsWith("/tech")) {
      return new Response("<html>missing listing</html>", { status: 200 });
    }
    return new Response(payload({ props: { pageProps: { initialData: { data: { events: [{ event: card("old") }, { event: card("new") }] } } } } }), {
      status: 200,
    });
  };
  const result = await fetchLuma(["https://luma.com/buenos-aires", "https://luma.com/discover/buenos-aires/tech", "https://luma.com/discover/buenos-aires/ai"]);
  assert.deepEqual(result.events.map((x) => x.title), ["Event old", "Event new"]);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /tech/);
});
