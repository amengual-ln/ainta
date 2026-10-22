import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export type DiscoveryProvider = "luma" | "eventbrite" | "meetup";
export interface DiscoverySource {
  name: string;
  url: string;
  provider: DiscoveryProvider;
}

const HOSTS: Record<DiscoveryProvider, string[]> = {
  luma: ["luma.com", "lu.ma"],
  eventbrite: ["eventbrite.com", "eventbrite.com.ar"],
  meetup: ["meetup.com"],
};

export function validateDiscoverySource(
  name: string,
  provider: string,
  rawUrl: string
): DiscoverySource | null {
  const normalized = provider.toLowerCase() as DiscoveryProvider;
  if (!(normalized in HOSTS)) return null;
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (!HOSTS[normalized].some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      return null;
    }
    if (normalized === "meetup" && !url.pathname.endsWith("/events/rss/")) return null;
    return { name, provider: normalized, url: url.toString() };
  } catch {
    return null;
  }
}

/** Notion is the sole source of configuration. Invalid active sources are reported, not fetched. */
export async function fetchDiscoverySources(): Promise<{
  sources: DiscoverySource[];
  errors: string[];
}> {
  const dbId = process.env.NOTION_EVENT_SOURCES_DB_ID;
  const token = process.env.NOTION_TOKEN;
  if (!dbId) throw new Error("NOTION_EVENT_SOURCES_DB_ID missing");
  if (!token) throw new Error("NOTION_TOKEN missing");

  const notion = new Client({ auth: token });
  const sources: DiscoverySource[] = [];
  const errors: string[] = [];
  const urls = new Set<string>();
  let cursor: string | undefined;

  do {
    const result = await notion.databases.query({
      database_id: dbId,
      page_size: 100,
      start_cursor: cursor,
      filter: { property: "Activa", checkbox: { equals: true } },
    });
    for (const entry of result.results) {
      if (entry.object !== "page" || !("properties" in entry)) continue;
      const page = entry as PageObjectResponse;
      const title = page.properties["Nombre"];
      const link = page.properties["URL"];
      const provider = page.properties["Proveedor"];
      const name = title?.type === "title" ? title.title.map((x) => x.plain_text).join("") : "";
      const url = link?.type === "url" ? link.url ?? "" : "";
      const label = provider?.type === "select" ? provider.select?.name ?? "" : "";
      const source = validateDiscoverySource(name, label, url);
      if (!source) {
        errors.push(`invalid active discovery source: ${name || page.id}`);
        continue;
      }
      if (urls.has(source.url)) continue;
      urls.add(source.url);
      sources.push(source);
    }
    cursor = result.has_more ? result.next_cursor ?? undefined : undefined;
  } while (cursor);

  return { sources, errors };
}
