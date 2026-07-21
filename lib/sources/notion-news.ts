import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NormalizedNewsItem, NewsSource } from "@/lib/normalize-news";

export interface NewsItem {
  title: string;
  url: string;
  summary: string;
  source: NewsSource;
  sourceName: string;
  publishedAt: string;
  day: string;
  month: string;
  tags: string[];
}

export interface NewsDiscoverDiscard {
  source: NewsSource;
  title: string;
  url: string;
  reason: "duplicate_in_batch" | "already_in_notion";
}

export interface NewsDiscoverResult {
  scraped: number;
  deduped: number;
  created: number;
  errors: string[];
  discarded: NewsDiscoverDiscard[];
}

function getNotion(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN missing");
  return new Client({ auth: token });
}

function isPageObject(
  r: QueryDatabaseResponse["results"][number]
): r is PageObjectResponse {
  return r.object === "page";
}

function getProp(page: PageObjectResponse, name: string) {
  return page.properties[name];
}

function readTitle(page: PageObjectResponse): string {
  const t = getProp(page, "Título");
  if (t?.type === "title") {
    return t.title.map((x) => x.plain_text).join("").trim();
  }
  return "";
}

function readUrl(page: PageObjectResponse, name: string): string {
  const p = getProp(page, name);
  if (p?.type === "url") return p.url ?? "";
  return "";
}

function readRichText(page: PageObjectResponse, name: string): string {
  const p = getProp(page, name);
  if (p?.type === "rich_text") {
    return p.rich_text.map((x) => x.plain_text).join("").trim();
  }
  return "";
}

function readSelect(page: PageObjectResponse, name: string): string | null {
  const p = getProp(page, name);
  if (p?.type === "select") return p.select?.name ?? null;
  if (p?.type === "status") return p.status?.name ?? null;
  return null;
}

function readMultiSelect(page: PageObjectResponse, name: string): string[] {
  const p = getProp(page, name);
  if (p?.type === "multi_select") return p.multi_select.map((s) => s.name);
  return [];
}

function readDate(page: PageObjectResponse, name: string): string | null {
  const p = getProp(page, name);
  if (p?.type === "date") return p.date?.start ?? null;
  return null;
}

const STATUS_NEW = "Por leer";
const STATUS_PUBLISHED = "Leído";

function monthShort(monthIdx: number): string {
  return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][
    monthIdx
  ];
}

function sourceFromName(name: string): NewsSource {
  const n = name.toLowerCase();
  if (n === "arxiv") return "arxiv";
  if (n === "hacker news" || n === "hackernews") return "hackernews";
  return "blog";
}

export async function fetchPublishedNews(): Promise<NewsItem[]> {
  const dbId = process.env.NOTION_NEWS_DB_ID;
  if (!dbId) return [];
  const notion = getNotion();

  try {
    const res = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: "Estado",
        status: { equals: STATUS_PUBLISHED },
      },
      sorts: [{ property: "Fecha", direction: "descending" }],
      page_size: 50,
    });

    const items: NewsItem[] = [];
    for (const r of res.results) {
      if (!isPageObject(r)) continue;
      const title = readTitle(r);
      const url = readUrl(r, "URL");
      const publishedAt = readDate(r, "Fecha");
      if (!title || !url || !publishedAt) continue;

      const d = new Date(publishedAt);
      if (Number.isNaN(d.getTime())) continue;

      const sourceName = readSelect(r, "Fuente") ?? "Otro";

      items.push({
        title,
        url,
        summary: readRichText(r, "Summary"),
        source: sourceFromName(sourceName),
        sourceName,
        publishedAt,
        day: String(d.getUTCDate()).padStart(2, "0"),
        month: monthShort(d.getUTCMonth()),
        tags: readMultiSelect(r, "Tags"),
      });
    }
    return items;
  } catch (err) {
    console.error("[notion-news] fetchPublishedNews failed:", (err as Error).message);
    return [];
  }
}

async function getExistingNewsUrls(): Promise<Set<string>> {
  const dbId = process.env.NOTION_NEWS_DB_ID;
  if (!dbId) return new Set();
  const notion = getNotion();
  const urls = new Set<string>();
  let cursor: string | undefined;

  for (let i = 0; i < 10; i++) {
    try {
      const res: QueryDatabaseResponse = await notion.databases.query({
        database_id: dbId,
        filter: { property: "URL", url: { is_not_empty: true } },
        page_size: 100,
        start_cursor: cursor,
      });
      for (const r of res.results) {
        if (!isPageObject(r)) continue;
        const u = readUrl(r, "URL");
        if (u) urls.add(u);
      }
      if (!res.has_more || !res.next_cursor) break;
      cursor = res.next_cursor;
    } catch (err) {
      console.error("[notion-news] getExistingNewsUrls failed:", (err as Error).message);
      break;
    }
  }
  return urls;
}

export async function writeDiscoveredNews(
  items: NormalizedNewsItem[]
): Promise<NewsDiscoverResult> {
  const dbId = process.env.NOTION_NEWS_DB_ID;
  const discarded: NewsDiscoverDiscard[] = [];

  if (!dbId) {
    return {
      scraped: items.length,
      deduped: 0,
      created: 0,
      errors: ["NOTION_NEWS_DB_ID missing"],
      discarded,
    };
  }

  const seen = new Set<string>();
  const unique: NormalizedNewsItem[] = [];
  for (const it of items) {
    if (seen.has(it.url)) {
      discarded.push({ source: it.source, title: it.title, url: it.url, reason: "duplicate_in_batch" });
      continue;
    }
    seen.add(it.url);
    unique.push(it);
  }

  let existing: Set<string>;
  try {
    existing = await getExistingNewsUrls();
  } catch (err) {
    return {
      scraped: items.length,
      deduped: 0,
      created: 0,
      errors: [`read existing: ${(err as Error).message}`],
      discarded,
    };
  }

  const toCreate: NormalizedNewsItem[] = [];
  for (const it of unique) {
    if (existing.has(it.url)) {
      discarded.push({ source: it.source, title: it.title, url: it.url, reason: "already_in_notion" });
      continue;
    }
    toCreate.push(it);
  }

  const deduped = items.length - unique.length + (unique.length - toCreate.length);

  if (toCreate.length === 0) {
    return { scraped: items.length, deduped, created: 0, errors: [], discarded };
  }

  const notion = getNotion();
  const errors: string[] = [];
  let created = 0;

  for (const it of toCreate) {
    try {
      await notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          Título: {
            title: [{ type: "text", text: { content: it.title.slice(0, 200) } }],
          },
          URL: { url: it.url },
          Summary: {
            rich_text: it.summary
              ? [{ type: "text", text: { content: it.summary.slice(0, 1900) } }]
              : [],
          },
          Fuente: { select: { name: it.sourceName } },
          Fecha: { date: { start: it.publishedAt.toISOString() } },
          Tags: { multi_select: it.tags.map((t) => ({ name: t })) },
          Estado: { status: { name: STATUS_NEW } },
        },
      });
      created++;
    } catch (err) {
      errors.push(`${it.title.slice(0, 40)}: ${(err as Error).message}`);
    }
  }

  return { scraped: items.length, deduped, created, errors, discarded };
}
