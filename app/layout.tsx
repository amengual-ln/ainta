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

/* Open Sauce Sans — wordmark "Spärck" del hero. Los 3 weights se cargan
   en paralelo para poder probar Light/Regular/Medium cambiando solo las
   dos variables en :root de globals.css (sin re-bundle ni reinstalar). */
const openSauceLight = localFont({
  src: "./fonts/OpenSauceSans-Light.ttf",
  variable: "--font-open-sauce-light",
  display: "swap",
});
const openSauceRegular = localFont({
  src: "./fonts/OpenSauceSans-Regular.ttf",
  variable: "--font-open-sauce-regular",
  display: "swap",
});
const openSauceMedium = localFont({
  src: "./fonts/OpenSauceSans-Medium.ttf",
  variable: "--font-open-sauce-medium",
  display: "swap",
});

const siteUrl = "https://sparck.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Spärck — Comunidad de Estudiantes de IA",
    template: "%s · Spärck",
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
    "Spärck",
  ],
  authors: [{ name: "Spärck" }],
  creator: "Spärck",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "Spärck",
    title: "Spärck — Comunidad de Estudiantes de IA y ciencia de datos",
    description:
      "Comunidad abierta de estudiantes y graduados de IA. Talleres, recursos y red de pares.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spärck — Comunidad de Estudiantes de IA y ciencia de datos",
    description:
      "Comunidad abierta de estudiantes y graduados de IA. Talleres, recursos y red de pares.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixelSquare.variable} ${openSauceLight.variable} ${openSauceRegular.variable} ${openSauceMedium.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body>
        <BgOrbs />
        {children}
      </body>
    </html>
  );
}
