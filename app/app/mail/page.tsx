import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InternalEmailComposer from "@/components/InternalEmailComposer";
import styles from "./email.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Correo interno",
  description: "Redacción y envío manual de correos de Spärck.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function InternalEmailPage() {
  const sender = process.env.RESEND_FROM ?? "RESEND_FROM sin configurar";
  const sendConfigured = Boolean(
    process.env.RESEND_API_KEY && process.env.RESEND_FROM
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Spärck, inicio">
          <Image src="/favicon.png" alt="" width={28} height={28} aria-hidden="true" />
          <span>Spärck</span>
        </Link>
        <Link href="/" className={styles.backLink}>
          Volver al sitio
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="email-title">
          <div>
            <p className={styles.kicker}>Herramienta interna</p>
            <h1 id="email-title">Correo de Spärck</h1>
            <p>
              Escribí un correo nuevo o respondé uno recibido por ImprovMX.
              El envío sale por Resend desde la cuenta configurada.
            </p>
          </div>
          <dl className={styles.senderStatus}>
            <div>
              <dt>Remitente</dt>
              <dd>{sender}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd data-ready={sendConfigured}>
                <span aria-hidden="true" />
                {sendConfigured ? "Resend listo" : "Falta configuración"}
              </dd>
            </div>
          </dl>
        </section>

        <div className={styles.workbench}>
          <InternalEmailComposer />

          <aside className={styles.guide} aria-labelledby="reply-guide-title">
            <h2 id="reply-guide-title">Para responder</h2>
            <ol>
              <li>Abrí el correo que ImprovMX reenvió a tu casilla.</li>
              <li>Copiá remitente, asunto y mensaje en el formulario.</li>
              <li>
                Si querés conservar el hilo, copiá el <code>Message-ID</code> desde
                “Mostrar original”.
              </li>
            </ol>
            <p>
              El <code>Message-ID</code> es opcional. Sin él, el correo se envía
              igual, aunque algunos clientes pueden abrir un hilo nuevo.
            </p>
          </aside>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Uso interno · protegido con credenciales</span>
        <span>ImprovMX recibe · Resend envía</span>
      </footer>
    </div>
  );
}
