import {
  isAiRelevant,
  normalizeNews,
  type NewsSourceFetchResult,
  type RawNewsItem,
} from "@/lib/normalize-news";

const HN_ALGOLIA_URL =
  "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI&hitsPerPage=30";

interface HnHit {
  title?: string;
  url?: string | null;
  story_text?: string | null;
  created_at?: string;
  objectID?: string;
}

export async function fetchHackerNews(): Promise<NewsSourceFetchResult> {
  const out: NewsSourceFetchResult = { items: [], rejected: [], errors: [] };

  try {
    const res = await fetch(HN_ALGOLIA_URL, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      out.errors.push(`hackernews http ${res.status}`);
      return out;
    }

    const data = (await res.json()) as { hits?: HnHit[] };
    const hits = data.hits ?? [];

    for (const hit of hits) {
      const title = hit.title?.trim() ?? "";
      if (!isAiRelevant(title, hit.story_text ?? "")) continue;

      const url =
        hit.url ??
        (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : "");

      const raw: RawNewsItem = {
        source: "hackernews",
        sourceName: "Hacker News",
        title,
        url,
        summary: hit.story_text ?? "",
        publishedAt: hit.created_at ?? "",
        tags: ["Industria"],
      };

      const n = normalizeNews(raw);
      if (!n) {
        out.rejected.push({
          source: "hackernews",
          title: raw.title || "(sin título)",
          url: raw.url,
          publishedAt: raw.publishedAt,
          reason: !raw.title || !raw.url ? "missing_field" : "invalid_published_at",
        });
        continue;
      }
      out.items.push(n);
    }
    return out;
  } catch (err) {
    out.errors.push(`hackernews: ${(err as Error).message}`);
    return out;
  }
}
