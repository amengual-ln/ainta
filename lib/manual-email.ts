const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const MESSAGE_ID_RE = /^<[^<>\s\r\n]+>$/;
const MAX_RECIPIENTS = 20;
const SITE_URL = (process.env.SITE_URL ?? "https://sparck.com.ar").replace(
  /\/+$/,
  ""
);
const INSTAGRAM_URL = "https://www.instagram.com/sparck.ai";
const LINKEDIN_URL = "https://www.linkedin.com/company/sparck-ai";

export interface ManualEmailInput {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  inReplyTo?: string;
}

export type ManualEmailValidation =
  | { ok: true; value: ManualEmailInput }
  | { ok: false; error: string };

function parseRecipients(value: unknown): string[] | null {
  if (value === undefined || value === null || value === "") return [];
  if (typeof value !== "string") return null;

  const recipients = value
    .split(/[;,]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (recipients.some((email) => email.length > 254 || !EMAIL_RE.test(email))) {
    return null;
  }

  return [...new Set(recipients)];
}

export function validateManualEmailPayload(payload: unknown): ManualEmailValidation {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "El contenido del correo no es válido." };
  }

  const input = payload as Record<string, unknown>;
  const to = parseRecipients(input.to);
  const cc = parseRecipients(input.cc);
  const bcc = parseRecipients(input.bcc);
  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const inReplyTo =
    typeof input.inReplyTo === "string" ? input.inReplyTo.trim() : "";

  if (!to || !cc || !bcc) {
    return { ok: false, error: "Revisá las direcciones de correo." };
  }
  if (to.length === 0) {
    return { ok: false, error: "Agregá al menos un destinatario." };
  }
  if (!subject || subject.length > 200 || /[\r\n]/.test(subject)) {
    return { ok: false, error: "El asunto debe tener entre 1 y 200 caracteres." };
  }
  if (!body || body.length > 20_000) {
    return { ok: false, error: "El mensaje debe tener entre 1 y 20.000 caracteres." };
  }
  if (inReplyTo && !MESSAGE_ID_RE.test(inReplyTo)) {
    return { ok: false, error: "El Message-ID debe tener el formato <id@dominio>." };
  }

  const toSet = new Set(to);
  const uniqueCc = cc.filter((email) => !toSet.has(email));
  const visibleSet = new Set([...to, ...uniqueCc]);
  const uniqueBcc = bcc.filter((email) => !visibleSet.has(email));
  if (to.length + uniqueCc.length + uniqueBcc.length > MAX_RECIPIENTS) {
    return { ok: false, error: `Podés enviar a un máximo de ${MAX_RECIPIENTS} destinatarios.` };
  }

  return {
    ok: true,
    value: {
      to,
      cc: uniqueCc,
      bcc: uniqueBcc,
      subject,
      body,
      ...(inReplyTo ? { inReplyTo } : {}),
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function manualEmailHtml(body: string): string {
  const content = escapeHtml(body).replace(/\n/g, "<br>");
  const logoUrl = `${SITE_URL}/favicon.png`;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:24px;background:#f7f8fa;color:#17191f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;line-height:1.65"><div style="max-width:680px;margin:0 auto"><div>${content}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;border-top:1px solid #dfe3e8"><tr><td style="padding-top:20px;vertical-align:middle"><a href="${escapeHtml(SITE_URL)}" target="_blank" rel="noopener" style="display:inline-block;vertical-align:middle;line-height:0"><img src="${escapeHtml(logoUrl)}" alt="Spärck" width="36" height="36" style="display:block;width:36px;height:36px;border:0;outline:none"></a><span style="display:inline-block;margin-left:10px;vertical-align:middle;font-size:18px;font-weight:600;letter-spacing:-0.02em;color:#17191f">Spärck</span></td><td align="right" style="padding-top:20px;font-size:13px;line-height:1.7;color:#69707d"><a href="${escapeHtml(SITE_URL)}" target="_blank" rel="noopener" style="color:#25866f;text-decoration:none">sparck.com.ar</a><br><a href="${escapeHtml(INSTAGRAM_URL)}" target="_blank" rel="noopener" style="color:#69707d;text-decoration:underline;text-underline-offset:2px">Instagram</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${escapeHtml(LINKEDIN_URL)}" target="_blank" rel="noopener" style="color:#69707d;text-decoration:underline;text-underline-offset:2px">LinkedIn</a></td></tr></table></div></body></html>`;
}

export function manualEmailText(body: string): string {
  return `${body}\n\n—\n${SITE_URL}\nInstagram: ${INSTAGRAM_URL}\nLinkedIn: ${LINKEDIN_URL}`;
}
