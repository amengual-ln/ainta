import { NextRequest, NextResponse } from "next/server";
import { validateManualEmailPayload } from "@/lib/manual-email";
import { sendManualEmail } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { ok: false, error: "Origen no permitido." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "El contenido del correo no es válido." },
      { status: 400 }
    );
  }

  const validated = validateManualEmailPayload(body);
  if (!validated.ok) {
    return NextResponse.json(validated, { status: 400 });
  }

  const result = await sendManualEmail(validated.value);
  if (!result.ok) {
    const unavailable = result.reason === "missing-env";
    return NextResponse.json(
      {
        ok: false,
        error: unavailable
          ? "El envío no está configurado en el servidor."
          : "Resend no pudo enviar el correo. Probá nuevamente.",
      },
      { status: unavailable ? 503 : 502 }
    );
  }

  return NextResponse.json({ ok: true, id: result.id });
}
