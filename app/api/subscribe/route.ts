import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 80;
const REQUEST_TIMEOUT_MS = 5000;

interface SubscribeBody {
  email?: unknown;
  name?: unknown;
  website?: unknown;
}

export async function POST(req: NextRequest) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const name = String(body?.name ?? "").trim().slice(0, MAX_NAME);
  const website = String(body?.website ?? "").trim();

  // Honeypot: real users never fill this
  if (website) {
    return NextResponse.json(
      { ok: false, error: "Rejected" },
      { status: 400 }
    );
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Email inválido" },
      { status: 400 }
    );
  }

  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_SUBSCRIBERS_DB_ID;

  if (!token || !dbId) {
    console.error("[subscribe] missing NOTION_TOKEN or NOTION_SUBSCRIBERS_DB_ID");
    return NextResponse.json(
      { ok: false, error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const notion = new Client({ auth: token });
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(Object.assign(new Error("Notion timeout"), { name: "AbortError" })),
      REQUEST_TIMEOUT_MS
    );
  });

  try {
    // Dedup: query for existing email first
    const existing = await Promise.race([
      notion.databases.query({
        database_id: dbId,
        filter: {
          property: "Email",
          email: { equals: email },
        },
        page_size: 1,
      }),
      timeout,
    ]);

    if (existing.results.length > 0) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await Promise.race([
      notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          Email: { email },
          Name: {
            rich_text: name
              ? [{ type: "text", text: { content: name } }]
              : [],
          },
          Date: { date: { start: new Date().toISOString() } },
          Source: { select: { name: "landing" } },
        },
      }),
      timeout,
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { name?: string; code?: string; message?: string };
    if (e.name === "AbortError") {
      console.error("[subscribe] timeout");
      return NextResponse.json(
        { ok: false, error: "Timeout" },
        { status: 504 }
      );
    }
    console.error("[subscribe] notion error:", e?.code, e?.message);
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar la suscripción" },
      { status: 500 }
    );
  }
}
