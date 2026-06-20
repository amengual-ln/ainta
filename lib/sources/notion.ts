import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NormalizedEvent, RejectedEvent } from "@/lib/normalize";

export type EventType = "taller" | "charla" | "externo" | "hackathon";

export interface EventItem {
  day: string;
  month: string;
  year: string;
  title: string;
  meta: string;
  type: EventType;
  url: string;
  source: "luma" | "eventbrite" | "meetup" | "sparck";
  notes: string;
  extraTags: string[];
  cost: "Gratis" | "Pago" | null;
}

export interface DiscoverDiscard {
  source: NormalizedEvent["source"];
  title: string;
  url: string;
  startAt: string;
  reason: "past" | "duplicate_in_batch" | "already_in_notion";
}

export interface DiscoverResult {
  scraped: number;
  deduped: number;
  created: number;
  filtered: number;
  errors: string[];
  discarded: DiscoverDiscard[];
}

const SOURCE_TAG_MAP: Record<string, EventType> = {
  Taller: "taller",
  Workshop: "taller",
  Charla: "charla",
  Meetup: "externo",
  Networking: "externo",
  Hackathon: "hackathon",
};

function tagClassFor(tags: string[]): EventType {
  for (const t of tags) {
    const mapped = SOURCE_TAG_MAP[t];
    if (mapped) return mapped;
  }
  return "externo";
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

function readDate(page: PageObjectResponse): string | null {
  const d = getProp(page, "Fecha");
  if (d?.type === "date") {
    return d.date?.start ?? null;
  }
  return null;
}

function readSelect(page: PageObjectResponse, name: string): string | null {
  const p = getProp(page, name);
  if (p?.type === "select") {
    return p.select?.name ?? null;
  }
  if (p?.type === "status") {
    return p.status?.name ?? null;
  }
  return null;
}

function readMultiSelect(page: PageObjectResponse, name: string): string[] {
  const p = getProp(page, name);
  if (p?.type === "multi_select") {
    return p.multi_select.map((s) => s.name);
  }
  return [];
}

function readRichText(page: PageObjectResponse, name: string): string {
  const p = getProp(page, name);
  if (p?.type === "rich_text") {
    return p.rich_text.map((x) => x.plain_text).join("").trim();
  }
  return "";
}

function readUrl(page: PageObjectResponse, name: string): string {
  const p = getProp(page, name);
  if (p?.type === "url") {
    return p.url ?? "";
  }
  return "";
}

function monthShort(monthIdx: number): string {
  return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][
    monthIdx
  ];
}

function dateParts(iso: string): { day: string; month: string; year: string } | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    month: monthShort(d.getUTCMonth()),
    year: String(d.getUTCFullYear()),
  };
}

function buildMeta(modality: string | null, location: string): string {
  const parts: string[] = [];
  if (modality) parts.push(modality);
  if (location && location.toLowerCase() !== (modality ?? "").toLowerCase()) {
    parts.push(location);
  }
  return parts.join(" · ");
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

export async function fetchCuratedEvents(): Promise<EventItem[]> {
  const dbId = process.env.NOTION_DISCOVERED_EVENTS_DB_ID;
  if (!dbId) return [];
  const notion = getNotion();

  try {
    const res = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          {
            property: "Status",
            status: { equals: "Curado" },
          },
          {
            property: "Fecha",
            date: { on_or_after: new Date().toISOString() },
          },
        ],
      },
      sorts: [{ property: "Fecha", direction: "ascending" }],
      page_size: 50,
    });

    const items: EventItem[] = [];
    for (const r of res.results) {
      if (!isPageObject(r)) continue;
      const title = readTitle(r);
      const fecha = readDate(r);
      const url = readUrl(r, "Link");
      if (!title || !fecha || !url) continue;

      const parts = dateParts(fecha);
      if (!parts) continue;

      const fuente = readSelect(r, "Fuente") ?? "Otro";
      const modality = readSelect(r, "Modalidad");
      const location = readRichText(r, "Lugar");
      const tags = readMultiSelect(r, "Tags");
      const notes = readRichText(r, "Notas");
      const costRaw = readSelect(r, "Costo");
      const cost: EventItem["cost"] =
        costRaw === "Pago" || costRaw === "Gratis" ? costRaw : null;
      const extraTags = tags.filter((t) => !(t in SOURCE_TAG_MAP));
      const source: EventItem["source"] =
        fuente.toLowerCase() === "spärck" ||
        fuente.toLowerCase() === "sparck"
          ? "sparck"
          : fuente.toLowerCase() === "luma"
          ? "luma"
          : fuente.toLowerCase() === "meetup"
          ? "meetup"
          : fuente.toLowerCase() === "eventbrite"
          ? "eventbrite"
          : "sparck";

      items.push({
        day: parts.day,
        month: parts.month,
        year: parts.year,
        title,
        meta: buildMeta(modality, location),
        type: source === "sparck" ? "taller" : tagClassFor(tags),
        url,
        source,
        notes,
        extraTags,
        cost,
      });
    }
    return items;
  } catch (err) {
    console.error("[notion] fetchCuratedEvents failed:", (err as Error).message);
    return [];
  }
}

async function getExistingLinksInDiscovered(): Promise<Set<string>> {
  const dbId = process.env.NOTION_DISCOVERED_EVENTS_DB_ID;
  if (!dbId) return new Set();
  const notion = getNotion();
  const links = new Set<string>();
  let cursor: string | undefined;

  for (let i = 0; i < 10; i++) {
    try {
      const res: QueryDatabaseResponse = await notion.databases.query({
        database_id: dbId,
        filter: { property: "Link", url: { is_not_empty: true } },
        page_size: 100,
        start_cursor: cursor,
      });
      for (const r of res.results) {
        if (!isPageObject(r)) continue;
        const u = readUrl(r, "Link");
        if (u) links.add(u);
      }
      if (!res.has_more || !res.next_cursor) break;
      cursor = res.next_cursor;
    } catch (err) {
      console.error("[notion] getExistingLinks failed:", (err as Error).message);
      break;
    }
  }
  return links;
}

export async function writeDiscoveredEvents(
  events: NormalizedEvent[]
): Promise<DiscoverResult> {
  const dbId = process.env.NOTION_DISCOVERED_EVENTS_DB_ID;
  const discarded: DiscoverDiscard[] = [];

  if (!dbId) {
    return {
      scraped: events.length,
      deduped: 0,
      created: 0,
      filtered: 0,
      errors: ["NOTION_DISCOVERED_EVENTS_DB_ID missing"],
      discarded,
    };
  }

  const now = Date.now();
  const future: NormalizedEvent[] = [];
  for (const e of events) {
    if (e.startAt.getTime() > now) {
      future.push(e);
    } else {
      discarded.push({
        source: e.source,
        title: e.title,
        url: e.url,
        startAt: e.startAt.toISOString(),
        reason: "past",
      });
    }
  }

  const sourceNameMap: Record<NormalizedEvent["source"], string> = {
    luma: "Luma",
    eventbrite: "Eventbrite",
    meetup: "Meetup",
  };

  const seen = new Set<string>();
  const unique: NormalizedEvent[] = [];
  for (const e of future) {
    if (seen.has(e.url)) {
      discarded.push({
        source: e.source,
        title: e.title,
        url: e.url,
        startAt: e.startAt.toISOString(),
        reason: "duplicate_in_batch",
      });
      continue;
    }
    seen.add(e.url);
    unique.push(e);
  }

  let existing: Set<string>;
  try {
    existing = await getExistingLinksInDiscovered();
  } catch (err) {
    return {
      scraped: events.length,
      deduped: 0,
      created: 0,
      filtered: 0,
      errors: [`read existing: ${(err as Error).message}`],
      discarded,
    };
  }

  const toCreate: NormalizedEvent[] = [];
  for (const e of unique) {
    if (existing.has(e.url)) {
      discarded.push({
        source: e.source,
        title: e.title,
        url: e.url,
        startAt: e.startAt.toISOString(),
        reason: "already_in_notion",
      });
      continue;
    }
    toCreate.push(e);
  }

  const deduped = future.length - unique.length + (unique.length - toCreate.length);
  const filtered = events.length - future.length;

  if (toCreate.length === 0) {
    return {
      scraped: events.length,
      deduped,
      created: 0,
      errors: [],
      filtered,
      discarded,
    };
  }

  const notion = getNotion();
  const errors: string[] = [];
  let created = 0;

  for (const ev of toCreate) {
    try {
      const modalidad: "Presencial" | "Online" | "Híbrido" = ev.modality;
      await notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          Título: {
            title: [{ type: "text", text: { content: ev.title.slice(0, 200) } }],
          },
          Fecha: { date: { start: ev.startAt.toISOString() } },
          Modalidad: { select: { name: modalidad } },
          Lugar: {
            rich_text: ev.location
              ? [{ type: "text", text: { content: ev.location.slice(0, 200) } }]
              : [],
          },
          Link: { url: ev.url },
          Fuente: { select: { name: sourceNameMap[ev.source] } },
          Costo: { select: { name: ev.cost } },
          "Encontrado por": {
            rich_text: [
              { type: "text", text: { content: `Auto · ${sourceNameMap[ev.source]}` } },
            ],
          },
        },
      });
      created++;
    } catch (err) {
      errors.push(`${ev.title.slice(0, 40)}: ${(err as Error).message}`);
    }
  }

  return {
    scraped: events.length,
    deduped,
    created,
    errors,
    filtered,
    discarded,
  };
}
