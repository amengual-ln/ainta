import Parser from "rss-parser";
import {
  normalizeNews,
  type NewsSourceFetchResult,
  type RawNewsItem,
} from "@/lib/normalize-news";

const ARXIV_API_URL =
  "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=15";

interface ArxivItem {
  title?: string;
  link?: string;
  summary?: string;
  isoDate?: string;
  pubDate?: string;
}

export async function fetchArxiv(): Promise<NewsSourceFetchResult> {
  const out: NewsSourceFetchResult = { items: [], rejected: [], errors: [] };

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(ARXIV_API_URL);
    const items = (feed.items ?? []) as ArxivItem[];

    for (const item of items) {
      const publishedAt = item.isoDate ?? item.pubDate ?? "";
      const raw: RawNewsItem = {
        source: "arxiv",
        sourceName: "arXiv",
        title: item.title?.replace(/\s+/g, " ").trim() ?? "",
        url: item.link ?? "",
        summary: item.summary ?? "",
        publishedAt,
        tags: ["Papers"],
      };

      const n = normalizeNews(raw);
      if (!n) {
        out.rejected.push({
          source: "arxiv",
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
    out.errors.push(`arxiv: ${(err as Error).message}`);
    return out;
  }
}
