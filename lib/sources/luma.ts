import {
  lumaToRaw,
  normalize,
  type SourceFetchResult,
} from "@/lib/normalize";

const LUMA_DISCOVERY_URL = "https://luma.com/buenos-aires";

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
  try {
    const res = await fetch(LUMA_DISCOVERY_URL, {
      headers: {
        accept: "text/html",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      out.errors.push(`luma http ${res.status}`);
      return out;
    }

    const html = await res.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/
    );
    if (!match) {
      out.errors.push("luma: __NEXT_DATA__ not found");
      return out;
    }

    const data = JSON.parse(match[1]) as LumaNextData;
    const events = data?.props?.pageProps?.initialData?.data?.events ?? [];

    for (const e of events) {
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
      out.events.push(n);
    }
    return out;
  } catch (err) {
    out.errors.push(`luma: ${(err as Error).message}`);
    return out;
  }
}