import Parser from "rss-parser";
import {
  isWithinLastDay,
  normalizeNews,
  type NewsSourceFetchResult,
  type RawNewsItem,
} from "@/lib/normalize-news";

interface BlogFeed {
  name: string;
  url: string;
}

const AI_BLOGS: BlogFeed[] = [
  { name: "OpenAI", url: "https://openai.com/news/rss.xml" },
  { name: "Google AI", url: "https://blog.google/technology/ai/rss/" },
  { name: "MIT Tech Review", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed" },
];

interface BlogRssItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
}

export async function fetchAiBlogs(): Promise<NewsSourceFetchResult> {
  const out: NewsSourceFetchResult = { items: [], rejected: [], errors: [] };
  const parser = new Parser({ timeout: 15000 });

  const results = await Promise.allSettled(
    AI_BLOGS.map(async (blog) => ({
      blog,
      feed: await parser.parseURL(blog.url),
    }))
  );

  for (const r of results) {
    if (r.status !== "fulfilled") {
      out.errors.push(`ai-blogs: ${(r.reason as Error)?.message ?? String(r.reason)}`);
      continue;
    }
    const { blog, feed } = r.value;
    const items = (feed.items ?? []) as BlogRssItem[];

    for (const item of items) {
      const raw: RawNewsItem = {
        source: "blog",
        sourceName: blog.name,
        title: item.title?.trim() ?? "",
        url: item.link ?? "",
        summary: item.contentSnippet ?? item.content ?? "",
        publishedAt: item.isoDate ?? item.pubDate ?? "",
        tags: ["Blog"],
      };

      const n = normalizeNews(raw);
      if (!n) {
        out.rejected.push({
          source: "blog",
          title: raw.title || "(sin título)",
          url: raw.url,
          publishedAt: raw.publishedAt,
          reason: !raw.title || !raw.url ? "missing_field" : "invalid_published_at",
        });
        continue;
      }
      if (!isWithinLastDay(n.publishedAt)) continue;
      out.items.push(n);
    }
  }

  return out;
}
