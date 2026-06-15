import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import BgOrbs from "@/components/BgOrbs";
import "./globals.css";

const geistSans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

const geistPixelSquare = localFont({
  src: "../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel-square",
  weight: "500",
  display: "swap",
});

const siteUrl = "https://ainta.community";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AINTA — Comunidad de Estudiantes de IA",
    template: "%s · AINTA",
  },
  description:
    "Comunidad abierta de estudiantes y graduados de IA — sin fronteras geográficas, sin jerarquías, sin humo. Talleres, recursos y red de pares.",
  keywords: [
    "IA",
    "Inteligencia Artificial",
    "Machine Learning",
    "Estudiantes",
    "Comunidad",
    "Talleres",
    "AINTA",
  ],
  authors: [{ name: "AINTA" }],
  creator: "AINTA",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "AINTA",
    title: "AINTA — Aprender IA entre quienes la viven de verdad",
    description:
      "Comunidad abierta de estudiantes y graduados de IA. Talleres, recursos y red de pares.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AINTA — Comunidad de Estudiantes de IA",
    description:
      "Aprender IA entre quienes la viven de verdad. Sumate a la comunidad.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#080B10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixelSquare.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body>
        <BgOrbs />
        {children}
      </body>
    </html>
  );
}
