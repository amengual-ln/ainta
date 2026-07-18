export type NewsSource = "arxiv" | "hackernews" | "blog";

export interface RawNewsItem {
  source: NewsSource;
  sourceName: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  tags: string[];
}

export interface NormalizedNewsItem {
  source: NewsSource;
  sourceName: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  tags: string[];
}

export type NewsRejectReason = "missing_field" | "invalid_published_at";

export interface RejectedNews {
  source: NewsSource;
  title: string;
  url: string;
  publishedAt: string;
  reason: NewsRejectReason;
}

export interface NewsSourceFetchResult {
  items: NormalizedNewsItem[];
  rejected: RejectedNews[];
  errors: string[];
}

const MAX_SUMMARY_LENGTH = 400;

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeNews(raw: RawNewsItem): NormalizedNewsItem | null {
  if (!raw.title || !raw.url || !raw.publishedAt) return null;

  const publishedAt = new Date(raw.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return null;

  return {
    source: raw.source,
    sourceName: raw.sourceName.trim(),
    title: raw.title.trim(),
    url: raw.url.trim(),
    summary: stripHtml(raw.summary).slice(0, MAX_SUMMARY_LENGTH),
    publishedAt,
    tags: raw.tags,
  };
}

const AI_KEYWORDS = [
  "artificial intelligence",
  " ai ",
  "ai ",
  " ai",
  "llm",
  "large language model",
  "machine learning",
  "deep learning",
  "neural network",
  "openai",
  "anthropic",
  "gemini",
  "chatgpt",
  "gpt-",
  "claude",
  "transformer",
  "generative ai",
]; 

export function isAiRelevant(title: string, extra = ""): boolean {
  const t = ` ${title} ${extra} `.toLowerCase();
  return AI_KEYWORDS.some((k) => t.includes(k));
}
