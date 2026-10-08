import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Spärck, comunidad de estudiantes de IA y datos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// La vista previa que aparece al compartir el link en WhatsApp, LinkedIn o X.
export default async function OpengraphImage() {
  const mark = await readFile(join(process.cwd(), "public/favicon.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(circle at 18% 22%, rgba(52, 168, 139, 0.28), #080B10 58%)",
          color: "#F0F0F5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={112} height={112} alt="" />
          <div style={{ fontSize: 112, letterSpacing: "-0.04em" }}>Spärck</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 26, letterSpacing: "0.12em", color: "#5DC9A8" }}>
            LA CHISPA QUE CONECTA EL CONOCIMIENTO
          </div>
          <div style={{ fontSize: 40, lineHeight: 1.3, color: "#C8CCE0", maxWidth: 900 }}>
            Comunidad de estudiantes de IA y datos en Argentina: eventos, recursos y una red de pares.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
