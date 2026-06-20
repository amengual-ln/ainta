import Parser from "rss-parser";
import { MEETUP_GROUPS } from "@/lib/meetup-groups";
import {
  meetupToRaw,
  normalize,
  parseMeetupEventJsonLd,
  modalityFromAttendanceMode,
  locationFromJsonLd,
  type RawEvent,
  type SourceFetchResult,
} from "@/lib/normalize";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface RssItem {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  contentSnippet?: string;
  "dc:creator"?: string;
}

async function fetchEventPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        accept: "text/html",
        "user-agent": UA,
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function buildRawFromJsonLd(item: RssItem, ld: ReturnType<typeof parseMeetupEventJsonLd>): RawEvent | null {
  if (!ld) return null;
  if (!ld.startDate) return null;

  const modality = modalityFromAttendanceMode(ld.eventAttendanceMode) ?? "Presencial";
  const location = locationFromJsonLd(ld);

  return {
    source: "meetup",
    sourceId: item.guid ?? item.link ?? "",
    title: item.title ?? "",
    url: item.link ?? "",
    startAt: ld.startDate,
    timezone: "America/Argentina/Buenos_Aires",
    modality,
    location,
    cost: "Gratis",
    tags: [],
  };
}

export async function fetchMeetup(): Promise<SourceFetchResult> {
  const out: SourceFetchResult = { events: [], rejected: [], errors: [] };

  const parser = new Parser({
    customFields: { item: ["dc:creator"] },
    headers: { "user-agent": UA },
  });

  const rssResults = await Promise.allSettled(
    MEETUP_GROUPS.map(async (g) => {
      const feed = await parser.parseURL(
        `https://www.meetup.com/${g.slug}/events/rss/`
      );
      return feed.items ?? [];
    })
  );

  const items: RssItem[] = [];
  for (const r of rssResults) {
    if (r.status !== "fulfilled") {
      out.errors.push(`meetup group: ${(r.reason as Error)?.message ?? String(r.reason)}`);
      continue;
    }
    for (const item of r.value) {
      items.push(item as RssItem);
    }
  }

  const pageResults = await Promise.allSettled(
    items.map(async (item) => {
      if (!item.link) {
        return { item, html: null as string | null };
      }
      const html = await fetchEventPage(item.link);
      return { item, html };
    })
  );

  for (const r of pageResults) {
    if (r.status !== "fulfilled") {
      const reason = (r.reason as Error)?.message ?? String(r.reason);
      out.errors.push(`meetup page: ${reason}`);
      continue;
    }
    const { item, html } = r.value;

    if (!item.title || !item.link) {
      const raw = meetupToRaw(item);
      if (!raw) {
        out.rejected.push({
          source: "meetup",
          title: item.title ?? "(no title)",
          url: item.link ?? "",
          startAt: item.pubDate ?? "",
          reason: "missing_field",
        });
        continue;
      }
      const n = normalize(raw);
      if (!n) {
        out.rejected.push({
          source: "meetup",
          title: raw.title,
          url: raw.url,
          startAt: raw.startAt,
          reason: !raw.startAt ? "missing_field" : "invalid_start_at",
        });
      } else {
        out.events.push(n);
      }
      continue;
    }

    if (html === null) {
      out.rejected.push({
        source: "meetup",
        title: item.title,
        url: item.link,
        startAt: item.pubDate ?? "",
        reason: "event_page_unfetched",
      });
      continue;
    }

    const ld = parseMeetupEventJsonLd(html);
    if (!ld) {
      out.rejected.push({
        source: "meetup",
        title: item.title,
        url: item.link,
        startAt: item.pubDate ?? "",
        reason: "no_jsonld_event",
      });
      continue;
    }

    if (!ld.startDate) {
      out.rejected.push({
        source: "meetup",
        title: item.title,
        url: item.link,
        startAt: item.pubDate ?? "",
        reason: "jsonld_missing_start_date",
      });
      continue;
    }

    const raw = buildRawFromJsonLd(item, ld);
    if (!raw) {
      out.rejected.push({
        source: "meetup",
        title: item.title,
        url: item.link,
        startAt: item.pubDate ?? "",
        reason: "no_jsonld_event",
      });
      continue;
    }

    const n = normalize(raw);
    if (!n) {
      out.rejected.push({
        source: "meetup",
        title: raw.title,
        url: raw.url,
        startAt: raw.startAt,
        reason: "invalid_start_at",
      });
      continue;
    }
    out.events.push(n);
  }

  return out;
}