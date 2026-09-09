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
const geistRegularFont = readFile(
  path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf"),
);
const geistMediumFont = readFile(
  path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf"),
);
const logoImage = readFile(path.join(process.cwd(), "public/favicon.png")).then(
  (file) => `data:image/png;base64,${file.toString("base64")}`,
);

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
  const title = cleanText(event.title);
  const featured = isFeaturedEvent(event);
  const longTitle = title.length > (compact ? 42 : 48);
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
        fontFamily: "Geist",
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
        <span style={{ fontSize: compact ? (featured ? 60 : 58) : featured ? 68 : 66, lineHeight: 1.25, fontWeight: 500 }}>
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
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#f1f5f4",
            fontSize: compact
              ? longTitle ? 35 : 39
              : longTitle ? 39 : 43,
            lineHeight: 1.15,
            fontWeight: 500,
            marginBottom: 10,
          }}
        >
          {title}
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
  const listOffset = selection.events.length <= 4 ? -78 : selection.events.length <= 6 ? -38 : 0;
  const [regular, medium, geistRegular, geistMedium, logo] = await Promise.all([
    regularFont,
    mediumFont,
    geistRegularFont,
    geistMediumFont,
    logoImage,
  ]);

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
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width="58" height="58" alt="" />
            <span style={{ fontSize: 58, fontWeight: 500, letterSpacing: -2 }}>Spärck</span>
          </div>
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
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              transform: `translateY(${listOffset}px)`,
            }}
          >
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
            bottom: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f1f5f4",
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: 1.2,
          }}
        >
          <div style={{ display: "flex" }}>
            <span>LA CHISPA QUE</span>
            <span style={{ color: "#5ed0b0", margin: "0 9px" }}>CONECTA</span>
            <span>EL CONOCIMIENTO</span>
          </div>
          {selection.remaining > 0 && (
            <span style={{ position: "absolute", right: 0, bottom: -44, color: "#67c7ad", fontSize: 20, letterSpacing: 0 }}>
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
        { name: "Geist", data: geistRegular, weight: 400 },
        { name: "Geist", data: geistMedium, weight: 500 },
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
