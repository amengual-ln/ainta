import {
  lumaToRaw,
  normalize,
  type SourceFetchResult,
} from "@/lib/normalize";

// Luma's city homepage is a curated subset. Category feeds surface events
// that may be missing from the general listing, regardless of their titles.
const LUMA_DISCOVERY_URLS = [
  "https://luma.com/buenos-aires",
  "https://luma.com/discover/buenos-aires/tech",
  "https://luma.com/discover/buenos-aires/ai",
] as const;

interface LumaNextData {
  props?: {
    pageProps?: {
      initialData?: {
        data?: {
          events?: Array<{
            event?: {
              api_id?: string;
              name?: string;
              url?: string;
              start_at?: string;
              timezone?: string;
              location_type?: string;
            };
          }>;
        };
      };
    };
  };
}

export async function fetchLuma(): Promise<SourceFetchResult> {
  const out: SourceFetchResult = { events: [], rejected: [], errors: [] };
  const seen = new Set<string>();

  // A category feed failing should not block the other feeds.
  const pages = await Promise.allSettled(
    LUMA_DISCOVERY_URLS.map(async (url) => {
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
        /<script id="__NEXT_DATA__" type="application\\/json">([\\s\\S]*?)<\\/script>/
      );
      if (!match) throw new Error("__NEXT_DATA__ not found");
      const data = JSON.parse(match[1]) as LumaNextData;
      const events = data?.props?.pageProps?.initialData?.data?.events;
      if (!Array.isArray(events)) throw new Error("event listing not found");
      return events;
    })
  );

  pages.forEach((page, index) => {
    const feed = LUMA_DISCOVERY_URLS[index];
    if (page.status === "rejected") {
      out.errors.push(`luma ${feed}: ${(page.reason as Error).message}`);
      return;
    }

    for (const e of page.value) {
      const ev = e.event ?? {};
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
