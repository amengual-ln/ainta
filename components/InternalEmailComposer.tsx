"use client";

import { FormEvent, useState } from "react";
import {
  CheckCircle,
  PaperPlaneTilt,
  SpinnerGap,
  WarningCircle,
} from "@phosphor-icons/react";
import styles from "@/app/app/mail/email.module.css";

type Mode = "compose" | "reply";
type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent"; id: string }
  | { status: "error"; message: string };

const initialFields = {
  to: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "",
  inReplyTo: "",
};

export default function InternalEmailComposer() {
  const [mode, setMode] = useState<Mode>("compose");
  const [fields, setFields] = useState(initialFields);
  const [showCopies, setShowCopies] = useState(false);
  const [sendState, setSendState] = useState<SendState>({ status: "idle" });

  function updateField(name: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    if (sendState.status === "error") setSendState({ status: "idle" });
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    if (
      nextMode === "reply" &&
      fields.subject &&
      !fields.subject.toLowerCase().startsWith("re:")
    ) {
      updateField("subject", `Re: ${fields.subject}`);
    }
  }

  function resetComposer() {
    setFields(initialFields);
    setMode("compose");
    setShowCopies(false);
    setSendState({ status: "idle" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendState({ status: "sending" });

    try {
      const response = await fetch("/api/internal/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...fields,
          inReplyTo: mode === "reply" ? fields.inReplyTo : "",
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        id?: string;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.id) {
        throw new Error(result.error ?? "No se pudo enviar el correo.");
      }

      setSendState({ status: "sent", id: result.id });
    } catch (error) {
      setSendState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo enviar el correo. Probá nuevamente.",
      });
    }
  }

  const isSending = sendState.status === "sending";
  const isSent = sendState.status === "sent";

  return (
    <section className={styles.composer} aria-labelledby="composer-title">
      <div className={styles.composerTopbar}>
        <div>
          <h2 id="composer-title">
            {mode === "compose" ? "Nuevo correo" : "Responder correo"}
          </h2>
          <p>Los campos con * son obligatorios.</p>
        </div>
        <div className={styles.modeSwitch} aria-label="Tipo de correo">
          <button
            type="button"
            aria-pressed={mode === "compose"}
            disabled={isSending || isSent}
            onClick={() => changeMode("compose")}
          >
            Nuevo
          </button>
          <button
            type="button"
            aria-pressed={mode === "reply"}
            disabled={isSending || isSent}
            onClick={() => changeMode("reply")}
          >
            Responder
          </button>
        </div>
      </div>

      <form className={styles.form} aria-busy={isSending} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="email-to">Para *</label>
            <button
              type="button"
              className={styles.copyToggle}
              aria-expanded={showCopies}
              disabled={isSending || isSent}
              onClick={() => setShowCopies((visible) => !visible)}
            >
              {showCopies ? "Ocultar CC/CCO" : "Agregar CC/CCO"}
            </button>
          </div>
          <input
            id="email-to"
            name="to"
            type="text"
            inputMode="email"
            autoComplete="off"
            required
            disabled={isSending || isSent}
            value={fields.to}
            onChange={(event) => updateField("to", event.target.value)}
            placeholder="persona@dominio.com"
            aria-describedby="email-to-help"
          />
          <p id="email-to-help" className={styles.help}>
            Separá varias direcciones con coma.
          </p>
        </div>

        {showCopies && (
          <div className={styles.copyFields}>
            <div className={styles.field}>
              <label htmlFor="email-cc">CC</label>
              <input
                id="email-cc"
                name="cc"
                type="text"
                inputMode="email"
                autoComplete="off"
                disabled={isSending || isSent}
                value={fields.cc}
                onChange={(event) => updateField("cc", event.target.value)}
                placeholder="equipo@dominio.com"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email-bcc">CCO</label>
              <input
                id="email-bcc"
                name="bcc"
                type="text"
                inputMode="email"
                autoComplete="off"
                disabled={isSending || isSent}
                value={fields.bcc}
                onChange={(event) => updateField("bcc", event.target.value)}
                placeholder="copia@dominio.com"
              />
            </div>
          </div>
        )}

        {mode === "reply" && (
          <div className={styles.field}>
            <label htmlFor="email-message-id">Message-ID original</label>
            <input
              id="email-message-id"
              name="inReplyTo"
              type="text"
              autoComplete="off"
              disabled={isSending || isSent}
              value={fields.inReplyTo}
              onChange={(event) => updateField("inReplyTo", event.target.value)}
              placeholder="<mensaje@dominio.com>"
              aria-describedby="email-message-id-help"
            />
            <p id="email-message-id-help" className={styles.help}>
              Opcional. Mantiene la respuesta dentro del hilo original.
            </p>
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="email-subject">Asunto *</label>
          <input
            id="email-subject"
            name="subject"
            type="text"
            autoComplete="off"
            required
            maxLength={200}
            disabled={isSending || isSent}
            value={fields.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            placeholder="Asunto del correo"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email-body">Mensaje *</label>
          <textarea
            id="email-body"
            name="body"
            required
            maxLength={20_000}
            disabled={isSending || isSent}
            value={fields.body}
            onChange={(event) => updateField("body", event.target.value)}
            placeholder="Escribí el mensaje…"
            aria-describedby="email-body-help"
          />
          <p id="email-body-help" className={styles.help}>
            Texto simple · {fields.body.length.toLocaleString("es-AR")} / 20.000
          </p>
        </div>

        <div className={styles.actionRow}>
          <div className={styles.feedback} aria-live="polite">
            {sendState.status === "error" && (
              <span data-state="error">
                <WarningCircle size={18} weight="fill" aria-hidden="true" />
                {sendState.message}
              </span>
            )}
            {sendState.status === "sent" && (
              <span data-state="sent">
                <CheckCircle size={18} weight="fill" aria-hidden="true" />
                Enviado · {sendState.id}
              </span>
            )}
          </div>

          {isSent ? (
            <button type="button" className={styles.secondaryButton} onClick={resetComposer}>
              Escribir otro
            </button>
          ) : (
            <button type="submit" className={styles.sendButton} disabled={isSending}>
              {isSending ? (
                <SpinnerGap className={styles.spinner} size={18} aria-hidden="true" />
              ) : (
                <PaperPlaneTilt size={18} weight="fill" aria-hidden="true" />
              )}
              {isSending ? "Enviando…" : mode === "reply" ? "Enviar respuesta" : "Enviar correo"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
