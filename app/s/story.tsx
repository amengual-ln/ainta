import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getEventDateParts,
  getEventStoryRange,
  isFeaturedEvent,
  selectStoryEvents,
  type EventStoryPeriod,
} from "@/lib/events";
import { fetchCuratedEvents, type EventItem } from "@/lib/sources/notion";

const regularFont = readFile(path.join(process.cwd(), "app/fonts/OpenSauceSans-Regular.ttf"));
const mediumFont = readFile(path.join(process.cwd(), "app/fonts/OpenSauceSans-Medium.ttf"));

function cleanText(value: string): string {
  return value.replace(/\*\*?|__/g, "").trim();
}

function eventBadges(event: EventItem): string[] {
  const badges: string[] = [];
  if (isFeaturedEvent(event)) badges.push("Destacado");
  if (event.source === "sparck") badges.push("Spärck");
  if (event.cost === "Pago") badges.push("Pago");
  if (event.notes.toLowerCase().includes("lista de espera")) badges.push("Lista de espera");
  return badges.slice(0, 2);
}

function StoryCard({ event, compact }: { event: EventItem; compact: boolean }) {
  const date = getEventDateParts(event.startAt);
  if (!date) return null;
  const featured = isFeaturedEvent(event);
  const location = event.location && event.location.toLowerCase() !== event.modality?.toLowerCase()
    ? cleanText(event.location)
    : "";
  const meta = [date.time ? `${date.time} h` : "", location].filter(Boolean).join("  |  ");
  const badges = eventBadges(event);
  const cardHeight = compact ? (featured ? 148 : 140) : featured ? 174 : 166;

  return (
    <div
      style={{
        display: "flex",
        flexShrink: 0,
        height: cardHeight,
        border: `${featured ? 2 : 1}px solid ${featured ? "#34A88B" : "#27313d"}`,
        borderRadius: 20,
        background: featured ? "#10201c" : "#0d1117",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: compact ? 116 : 132,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRight: `1px solid ${featured ? "#2d826e" : "#27313d"}`,
          color: featured ? "#5ed0b0" : "#dce5e2",
        }}
      >
        <span style={{ fontSize: compact ? (featured ? 64 : 62) : featured ? 73 : 70, lineHeight: 1, fontWeight: 500 }}>
          {date.day}
        </span>
        <span style={{ fontSize: featured ? 30 : 29, marginTop: 7 }}>{date.month}</span>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          padding: compact ? "17px 24px" : "21px 28px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            color: "#f1f5f4",
            fontSize: compact ? (featured ? 39 : 37) : featured ? 43 : 42,
            lineHeight: compact ? 1.08 : 1.12,
            fontWeight: 500,
            maxHeight: compact ? 74 : 85,
            marginBottom: 4,
            overflow: "hidden",
          }}
        >
          {cleanText(event.title)}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <span
            style={{
              color: "#9aa7a3",
              fontSize: compact ? 24 : 26,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              maxWidth: badges.length ? 570 : 700,
            }}
          >
            {meta || "Más información en el sitio"}
          </span>
          {badges.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {badges.map((badge) => (
                <span
                  key={badge}
                  style={{
                    borderRadius: 999,
                    padding: "5px 10px",
                    background: badge === "Destacado" ? "#34A88B" : "#1b252c",
                    color: badge === "Destacado" ? "#07110e" : "#c5cfcc",
                    fontSize: 17,
                    fontWeight: 500,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function createEventStory(period: EventStoryPeriod) {
  const range = getEventStoryRange(period);
  const limit = period === "week" ? 6 : 8;
  const allEvents = await fetchCuratedEvents({ from: range.start, through: range.end });
  const selection = selectStoryEvents(allEvents, range, limit, period === "month");
  const compact = period === "month";
  const [regular, medium] = await Promise.all([regularFont, mediumFont]);

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          background: "#080b10",
          color: "#f1f5f4",
          padding: "148px 104px 150px",
          fontFamily: "Open Sauce",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            borderRadius: 620,
            border: "1px solid #17352d",
            top: -280,
            right: -250,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "#0c1715",
            bottom: -220,
            left: -180,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 58, fontWeight: 500, letterSpacing: -2 }}>Spärck</span>
          <span style={{ color: "#67c7ad", fontSize: 30 }}>sparck.com.ar</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 62, marginBottom: 48 }}>
          <h1
            style={{
              margin: 0,
              fontSize: period === "week" ? 77 : 82,
              lineHeight: 1,
              letterSpacing: -3.8,
              fontWeight: 500,
            }}
          >
            {range.title}
          </h1>
          <span style={{ color: "#9aa7a3", fontSize: 35, marginTop: 20 }}>{range.label}</span>
        </div>

        {selection.events.length > 0 ? (
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: compact ? 13 : 16 }}>
              {selection.events.map((event) => (
                <StoryCard key={event.url} event={event} compact={compact} />
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              borderTop: "1px solid #27313d",
              borderBottom: "1px solid #27313d",
              color: "#dce5e2",
            }}
          >
            <span style={{ fontSize: 53, fontWeight: 500 }}>Agenda en preparación</span>
            <span style={{ color: "#9aa7a3", fontSize: 29, marginTop: 18 }}>
              Encontrá nuevas actividades en sparck.com.ar/eventos
            </span>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 104,
            right: 104,
            bottom: 82,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#82908c",
            fontSize: 28,
          }}
        >
          <span>La chispa que conecta el conocimiento</span>
          {selection.remaining > 0 && (
            <span style={{ color: "#67c7ad" }}>
              +{selection.remaining} {selection.remaining === 1 ? "evento más" : "eventos más"} en /eventos
            </span>
          )}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Open Sauce", data: regular, weight: 400 },
        { name: "Open Sauce", data: medium, weight: 500 },
      ],
      headers: {
        "Content-Disposition": `attachment; filename="sparck-eventos-${period === "week" ? "semana" : "mes"}-${range.fileStamp}.png"`,
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
  response.headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  );
  return response;
}
