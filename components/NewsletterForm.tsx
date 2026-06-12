"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Ingresá un email.");
      return;
    }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      setStatus("error");
      setMessage("Email inválido.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    await new Promise((r) => setTimeout(r, 600));
    // eslint-disable-next-line no-console
    console.log("[newsletter stub] subscribe:", trimmed);

    setStatus("success");
    setMessage("Listo! Bienvenido a la comunidad :)");
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="font-body mx-auto"
      style={{ marginTop: "40px", maxWidth: "420px" }}
      noValidate
    >
      <div
        className="flex flex-col sm:flex-row items-stretch"
        style={{
          gap: "8px",
          padding: "6px",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          background: "rgba(8,11,16,0.5)",
        }}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
          placeholder="tu@email.com"
          autoComplete="email"
          required
          className="flex-1 bg-transparent outline-none text-white placeholder:text-muted"
          style={{
            fontSize: "14px",
            padding: "10px 14px",
            color: "var(--white)",
          }}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontSize: "14px", padding: "10px 18px" }}
        >
          {status === "submitting" ? "Enviando…" : "Suscribirme"}
        </button>
      </div>

      {message && (
        <p
          className="text-[12px] mt-2"
          style={{
            color: status === "error" ? "#fca5a5" : "var(--indigo-soft)",
            minHeight: "1em",
          }}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
