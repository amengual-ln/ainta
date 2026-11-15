import {
  eventbriteToRaw,
  normalize,
  type SourceFetchResult,
} from "@/lib/normalize";

interface EventbriteServerData {
  search_data?: {
    events?: {
      results?: Array<{
        id?: string | number;
        name?: string;
        url?: string;
        start_date?: string;
        start_time?: string;
        timezone?: string;
        is_online_event?: boolean;
        is_free?: boolean | null;
        primary_venue?: {
          name?: string;
          address?: { localized_address_display?: string };
        };
      }>;
    };
  };
}

export async function fetchEventbrite(urls: string[]): Promise<SourceFetchResult> {
  const out: SourceFetchResult = { events: [], rejected: [], errors: [] };
  const seen = new Set<string>();
  for (const sourceUrl of urls) {
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        accept: "text/html",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      out.errors.push(`eventbrite ${sourceUrl}: http ${res.status}`);
      continue;
    }

    const html = await res.text();
    const match = html.match(/window\.__SERVER_DATA__ = (\{.*?\});/);
    if (!match) {
      out.errors.push(`eventbrite ${sourceUrl}: __SERVER_DATA__ not found`);
      continue;
    }

    const data = JSON.parse(match[1]) as EventbriteServerData;
    const events = data?.search_data?.events?.results ?? [];

    for (const e of events) {
      const raw = eventbriteToRaw(e);
      if (!raw) {
        out.rejected.push({
          source: "eventbrite",
          title: e.name ?? "(no name)",
          url: e.url ?? "",
          startAt: e.start_date ?? "",
          reason: "missing_field",
        });
        continue;
      }
      const n = normalize(raw);
      if (!n) {
        out.rejected.push({
          source: "eventbrite",
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
      if (seen.has(n.url)) continue;
      seen.add(n.url);
      out.events.push(n);
    }
  } catch (err) {
    out.errors.push(`eventbrite ${sourceUrl}: ${(err as Error).message}`);
  }
  }
  return out;
}