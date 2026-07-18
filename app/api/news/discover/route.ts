import { NextRequest, NextResponse } from "next/server";
import { fetchArxiv } from "@/lib/sources/arxiv-news";
import { fetchHackerNews } from "@/lib/sources/hackernews";
import { fetchAiBlogs } from "@/lib/sources/ai-blogs";
import { writeDiscoveredNews } from "@/lib/sources/notion-news";
import type { RejectedNews } from "@/lib/normalize-news";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "NOTION_TOKEN missing" },
      { status: 500 }
    );
  }

  const [arxiv, hackernews, blogs] = await Promise.all([
    fetchArxiv(),
    fetchHackerNews(),
    fetchAiBlogs(),
  ]);

  const all = [...arxiv.items, ...hackernews.items, ...blogs.items];
  const rejected: RejectedNews[] = [
    ...arxiv.rejected,
    ...hackernews.rejected,
    ...blogs.rejected,
  ];
  const sourceErrors: string[] = [
    ...arxiv.errors,
    ...hackernews.errors,
    ...blogs.errors,
  ];

  const result = await writeDiscoveredNews(all);

  return NextResponse.json({
    ok: true,
    sources: {
      arxiv: { scraped: arxiv.items.length, rejected: arxiv.rejected.length, errors: arxiv.errors },
      hackernews: {
        scraped: hackernews.items.length,
        rejected: hackernews.rejected.length,
        errors: hackernews.errors,
      },
      blogs: { scraped: blogs.items.length, rejected: blogs.rejected.length, errors: blogs.errors },
    },
    sourceErrors,
    rejected,
    ...result,
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST" },
    { status: 405 }
  );
}
