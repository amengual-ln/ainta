import {
  lumaToRaw,
  normalize,
  type SourceFetchResult,
} from "../normalize.ts";

export interface LumaEventRecord {
  api_id?: string;
  name?: string;
  url?: string;
  start_at?: string;
  timezone?: string;
  location_type?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Luma's city homepage and category pages put event cards at different paths
 * inside __NEXT_DATA__. Walk the serialized page state, rather than depending
 * on initialData.data.events, and only keep objects with event-card fields.
 */
export function extractLumaEvents(data: unknown): LumaEventRecord[] {
  const events: LumaEventRecord[] = [];
  const visited = new Set<object>();
  let remaining = 50_000;

  function walk(value: unknown, depth: number): void {
    if (depth > 25 || remaining-- <= 0 || !value || typeof value !== "object") return;
    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
      return;
    }
    if (!isObject(value)) return;

    // Event cards can be bare objects or nested inside { event: ... }.
    if (
      typeof value.name === "string" &&
      typeof value.url === "string" &&
      typeof value.start_at === "string"
    ) {
      events.push(value as LumaEventRecord);
      return;
    }
    for (const child of Object.values(value)) walk(child, depth + 1);
  }

  walk(data, 0);
  return events;
}

export async function fetchLuma(urls: string[]): Promise<SourceFetchResult> {
  const out: SourceFetchResult = { events: [], rejected: [], errors: [] };
  const seen = new Set<string>();

  // A category feed failing should not block the other feeds.
  const pages = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, {
        headers: {
          accept: "text/html",
          "user-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`http ${res.status}`);

      const html = await res.text();
      const match = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
      );
      if (!match) throw new Error("__NEXT_DATA__ not found");
      const data: unknown = JSON.parse(match[1]);
      const events = extractLumaEvents(data);
      if (events.length === 0) throw new Error("no event cards found in __NEXT_DATA__");
      return events;
    })
  );

  pages.forEach((page, index) => {
    const feed = urls[index];
    if (page.status === "rejected") {
      out.errors.push(`luma ${feed}: ${(page.reason as Error).message}`);
      return;
    }

    for (const e of page.value) {
      const ev = e;
      const raw = lumaToRaw(ev);
      if (!raw) {
        out.rejected.push({
          source: "luma",
          title: ev.name ?? "(no name)",
          url: ev.url ?? "",
          startAt: ev.start_at ?? "",
          reason: "missing_field",
        });
        continue;
      }
      const n = normalize(raw);
      if (!n) {
        out.rejected.push({
          source: "luma",
          title: raw.title,
          url: raw.url,
          startAt: raw.startAt,
          reason: !raw.startAt
            ? "missing_field"
            : Number.isNaN(new Date(raw.startAt).getTime())
            ? "invalid_start_at"
            : "normalize_rejected",
        });
        continue;
      }
      // Repeated listings represent the same event, not new discoveries.
      const key = ev.api_id ?? n.url;
      if (seen.has(key)) continue;
      seen.add(key);
      out.events.push(n);
    }
  });

  return out;
}
