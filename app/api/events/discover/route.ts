import { NextRequest, NextResponse } from "next/server";
import { fetchLuma } from "@/lib/sources/luma";
import { fetchEventbrite } from "@/lib/sources/eventbrite";
import { fetchMeetup } from "@/lib/sources/meetup";
import { writeDiscoveredEvents } from "@/lib/sources/notion";
import { fetchDiscoverySources } from "@/lib/sources/config";
import type { RejectedEvent } from "@/lib/normalize";

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

  let configuration: Awaited<ReturnType<typeof fetchDiscoverySources>>;
  try {
    configuration = await fetchDiscoverySources();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: `discovery sources: ${(error as Error).message}` },
      { status: 502 }
    );
  }
  const urls = (provider: "luma" | "eventbrite" | "meetup") =>
    configuration.sources.filter((s) => s.provider === provider).map((s) => s.url);

  const [luma, eventbrite, meetup] = await Promise.all([
    fetchLuma(urls("luma")),
    fetchEventbrite(urls("eventbrite")),
    fetchMeetup(urls("meetup")),
  ]);

  const all = [...luma.events, ...eventbrite.events, ...meetup.events];
  const rejected: RejectedEvent[] = [
    ...luma.rejected,
    ...eventbrite.rejected,
    ...meetup.rejected,
  ];
  const sourceErrors: string[] = [
    ...configuration.errors,
    ...luma.errors,
    ...eventbrite.errors,
    ...meetup.errors,
  ];

  const result = await writeDiscoveredEvents(all);

  return NextResponse.json({
    ok: true,
    configuredSources: configuration.sources.length,
    sources: {
      luma: { scraped: luma.events.length, rejected: luma.rejected.length, errors: luma.errors },
      eventbrite: {
        scraped: eventbrite.events.length,
        rejected: eventbrite.rejected.length,
        errors: eventbrite.errors,
      },
      meetup: {
        scraped: meetup.events.length,
        rejected: meetup.rejected.length,
        errors: meetup.errors,
      },
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