"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

interface ApiOk {
  ok: true;
  duplicate?: boolean;
}
interface ApiErr {
  ok: false;
  error: string;
}
type ApiResponse = ApiOk | ApiErr;

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus("error");
      setMessage("Ingresá un email.");
      return;
    }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!valid) {
      setStatus("error");
      setMessage("Email inválido.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    const website = (
      (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)
        ?.value ?? ""
    ).trim();

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: name.trim(),
          website,
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok || !data || data.ok === false) {
        const err =
          (data && "error" in data && data.error) ||
          "No se pudo suscribir. Probá de nuevo.";
        setStatus("error");
        setMessage(err);
        return;
      }

      setStatus("success");
      setMessage(
        data.duplicate
          ? "Ya estabas en la lista. ¡Gracias!"
          : "Listo! Bienvenido a la comunidad."
      );
      setEmail("");
      setName("");
    } catch (err) {
      console.error("[newsletter] network error", err);
      setStatus("error");
      setMessage("Sin conexión. Probá de nuevo.");
    }
  };

  const inputStyle: React.CSSProperties = {
    fontSize: "14px",
    padding: "14px 16px",
    color: "var(--white)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="font-body mx-auto relative"
      style={{ marginTop: "40px", maxWidth: "420px" }}
      noValidate
    >
      <div
        className="flex flex-col"
        style={{
          border: "1px solid var(--border)",
          borderRadius: "12px",
          background: "rgba(8,11,16,0.5)",
          overflow: "hidden",
        }}
      >
        <label htmlFor="newsletter-name" className="sr-only">
          Nombre
        </label>
        <input
          id="newsletter-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          autoComplete="given-name"
          maxLength={80}
          className="bg-transparent outline-none w-full placeholder:text-muted"
          style={{
            ...inputStyle,
            borderBottom: "1px solid var(--border)",
            borderRadius: 0,
          }}
        />

        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          name="email"
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
          className="bg-transparent outline-none w-full placeholder:text-muted"
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ marginTop: "12px", padding: "14px 20px" }}
      >
        {status === "submitting" ? "Enviando…" : "Suscribirme →"}
      </button>

      {/* Honeypot: hidden from real users, filled by bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        defaultValue=""
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />

      {message && (
        <p
          className="text-[12px] mt-3 text-center"
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
