import { Resend } from "resend";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "missing-env" | "send-failed"; error?: unknown };

let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendWelcomeEmail(
  to: string,
  name?: string
): Promise<SendResult> {
  const from = process.env.RESEND_FROM;
  if (!from) {
    console.error("[resend] missing RESEND_FROM");
    return { ok: false, reason: "missing-env" };
  }

  const resend = client();
  if (!resend) {
    console.error("[resend] missing RESEND_API_KEY");
    return { ok: false, reason: "missing-env" };
  }

  const safeName = name ? escapeHtml(name) : "";
  const greeting = safeName ? `Hola, ${safeName}` : "Hola";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6;">
      <p>${greeting} — gracias por sumarte a Spärck.</p>
      <p>Somos una comunidad de estudiantes y graduados de IA en Argentina. Te avisaremos por acá cuando haya talleres, meetups y recursos nuevos.</p>
      <p style="color: #64748b; font-size: 14px;">— Equipo Spärck</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Bienvenido a Spärck",
      html,
    });

    if (error || !data) {
      console.error("[resend] send error:", error);
      return { ok: false, reason: "send-failed", error };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[resend] send exception:", err);
    return { ok: false, reason: "send-failed", error: err };
  }
}
