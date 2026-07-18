import type { NewsItem } from "@/lib/sources/notion-news";

const sourceLabel: Record<NewsItem["source"], string> = {
  arxiv: "arXiv",
  hackernews: "Hacker News",
  blog: "Blog",
};

interface NewsListProps {
  news: NewsItem[];
  emptyMessage?: string;
}

export default function NewsList({
  news,
  emptyMessage = "Pronto habrá noticias.",
}: NewsListProps) {
  if (news.length === 0) {
    return (
      <div
        className="event-list"
        style={{
          padding: "48px 32px",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: "14px",
          background: "rgba(13, 17, 23, 0.4)",
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="news-list">
      {news.map((item, i) => (
        <a
          key={`${item.url}-${i}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-row hover-card no-accent"
        >
          <div className="news-date">
            <div className="news-day">{item.day}</div>
            <div className="news-month">{item.month}</div>
          </div>
          <div className="news-body">
            <div className="news-title">{item.title}</div>
            {item.summary && <div className="news-summary">{item.summary}</div>}
            <div className="news-meta">
              <span>{sourceLabel[item.source] ?? item.sourceName}</span>
              {item.tags.map((t) => (
                <span key={t} className="event-badge tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
