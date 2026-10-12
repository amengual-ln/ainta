import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  curateEventWithGroq,
  fetchEventDescription,
  type CurationInput,
} from "@/lib/event-curation";
import {
  fetchEventCurationCandidates,
  updateEventCuration,
} from "@/lib/sources/notion";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const BATCH_LIMIT = 3;

function isAuthorized(request: NextRequest, secret: string): boolean {
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: NextRequest) {
  const secret = process.env.CURATION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CURATION_SECRET missing" },
      { status: 500 }
    );
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "GROQ_API_KEY missing" },
      { status: 500 }
    );
  }

  try {
    const { events, hasMore } = await fetchEventCurationCandidates(BATCH_LIMIT);
    if (events.length === 0) {
      return NextResponse.json({ ok: true, found: 0, analyzed: 0, hasMore: false, errors: [] });
    }

    const pageResults = await Promise.allSettled(
      events.map(async (event): Promise<CurationInput> => ({
        id: event.pageId,
        title: event.title,
        source: event.source,
        url: event.url,
        startAt: event.startAt,
        modality: event.modality,
        location: event.location,
        cost: event.cost,
        description: await fetchEventDescription(event.url, event.source),
      }))
    );

    const inputs: CurationInput[] = [];
    const errors: string[] = [];
    pageResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        inputs.push(result.value);
      } else {
        errors.push(
          `${events[index].title.slice(0, 60)}: ${(result.reason as Error).message}`
        );
      }
    });

    if (inputs.length === 0) {
      return NextResponse.json(
        { ok: false, found: events.length, analyzed: 0, hasMore, errors },
        { status: 502 }
      );
    }

    const groqCalls = await Promise.allSettled(
      inputs.map((input) => curateEventWithGroq(input))
    );
    const results = groqCalls.flatMap((call, index) => {
      if (call.status === "fulfilled") return [call.value];
      errors.push(`${inputs[index].title.slice(0, 60)}: ${(call.reason as Error).message}`);
      return [];
    });
    if (results.length === 0) {
      return NextResponse.json(
        { ok: false, found: events.length, analyzed: 0, hasMore, errors },
        { status: 502 }
      );
    }

    const candidateById = new Map(events.map((event) => [event.pageId, event]));
    let analyzed = 0;
    for (const result of results) {
      const candidate = candidateById.get(result.id);
      if (!candidate) continue;
      try {
        await updateEventCuration(candidate, result);
        analyzed += 1;
      } catch (error) {
        errors.push(`${candidate.title.slice(0, 60)}: ${(error as Error).message}`);
      }
    }

    return NextResponse.json({
      ok: errors.length === 0,
      found: events.length,
      enriched: inputs.length,
      analyzed,
      hasMore,
      errors,
    });
  } catch (error) {
    console.error("[events/curate] failed:", (error as Error).message);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST" },
    { status: 405 }
  );
}
