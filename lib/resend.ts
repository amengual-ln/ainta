import { Resend } from "resend";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "missing-env" | "send-failed"; error?: unknown };

const BRAND = {
  bg: "#080B10",
  cardBg: "#0D1117",
  cardBorder: "#1F2630",
  border: "#1F2630",
  text: "#F0F0F5",
  textMuted: "#B8BCC8",
  muted: "#8B8FA8",
  accent: "#34A88B",
  accentSoft: "#5DC9A8",
  ctaText: "#062419",
} as const;

const SITE_URL = (process.env.SITE_URL ?? "https://sparck.com.ar").replace(
  /\/+$/,
  ""
);

const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const FONT_MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

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

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

function welcomeHtml(name: string): string {
  const safeName = name ? escapeHtml(name) : "";
  const greeting = safeName ? `Hola, ${safeName}.` : "Hola.";
  const logoUrl = `${SITE_URL}/favicon.png`;
  const eventsUrl = `${SITE_URL}/eventos`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Bienvenido a Spärck</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.bg};">
<tr>
<td align="center" style="padding:48px 16px;">

<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background:${BRAND.cardBg};border:1px solid ${BRAND.cardBorder};border-radius:16px;border-collapse:separate;">

<tr>
<td style="padding:40px 40px 28px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
<tr>
<td valign="middle" style="padding-right:14px;line-height:0;">
<img src="${escapeAttr(logoUrl)}" alt="Spärck" width="36" height="36" style="display:block;border:0;outline:none;text-decoration:none;width:36px;height:36px;">
</td>
<td valign="middle" style="font-family:${FONT_SANS};font-size:18px;font-weight:600;letter-spacing:-0.02em;color:${BRAND.text};line-height:1;">
Spärck
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 40px 14px;">
<span style="font-family:${FONT_MONO};font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.accentSoft};">
Bienvenido
</span>
</td>
</tr>

<tr>
<td style="padding:0 40px 20px;font-family:${FONT_SANS};">
<h1 style="margin:0;font-family:${FONT_SANS};font-size:30px;line-height:1.15;letter-spacing:-0.03em;font-weight:600;color:${BRAND.text};mso-line-height-rule:exactly;">
${greeting}
</h1>
</td>
</tr>

<tr>
<td style="padding:0 40px 32px;font-family:${FONT_SANS};font-size:15px;line-height:1.65;color:${BRAND.textMuted};">
<p style="margin:0 0 12px;">Gracias por sumarte a Spärck.</p>
<p style="margin:0;">Somos una comunidad de estudiantes y graduados de IA en Argentina. Te avisaremos por acá cuando haya talleres, meetups y recursos nuevos.</p>
</td>
</tr>

<tr>
<td style="padding:0 40px 40px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="center" bgcolor="${BRAND.accent}" style="background:${BRAND.accent};border-radius:10px;">
<a href="${escapeAttr(eventsUrl)}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 24px;font-family:${FONT_SANS};font-size:14px;font-weight:500;color:${BRAND.ctaText};text-decoration:none;border-radius:10px;letter-spacing:-0.005em;">
Ver próximos eventos &rarr;
</a>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:24px 40px 32px;border-top:1px solid ${BRAND.border};">
<p style="margin:0;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.04em;color:${BRAND.muted};">
Hecho por estudiantes, para estudiantes &middot; <a href="${escapeAttr(SITE_URL)}" style="color:${BRAND.muted};text-decoration:underline;text-decoration-color:${BRAND.muted};text-underline-offset:2px;">sparck.com.ar</a>
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;
}

function welcomeText(name: string): string {
  const safeName = name ? name.trim() : "";
  const greeting = safeName ? `Hola, ${safeName}.` : "Hola.";
  return `${greeting}

Gracias por sumarte a Spärck.

Somos una comunidad de estudiantes y graduados de IA en Argentina. Te avisaremos por acá cuando haya talleres, meetups y recursos nuevos.

Ver próximos eventos: ${SITE_URL}/eventos

-
Hecho por estudiantes, para estudiantes. ${SITE_URL}`;
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

  const safeName = (name ?? "").slice(0, 80);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Bienvenido a Spärck",
      html: welcomeHtml(safeName),
      text: welcomeText(safeName),
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
