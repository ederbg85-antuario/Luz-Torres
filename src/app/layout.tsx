import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://luztorres.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Luz Torres · Asesora Inmobiliaria | Venta y renta de casas y departamentos",
    template: "%s · Luz Torres",
  },
  description:
    "Asesoría inmobiliaria integral en México. Compra, venta y renta de casas, departamentos, oficinas y más, con acompañamiento técnico, legal y financiero de principio a fin.",
  keywords: [
    "venta de casas",
    "renta de departamentos",
    "casas en venta",
    "departamentos en renta",
    "asesora inmobiliaria",
    "bienes raíces México",
    "propiedades en venta",
    "inmuebles México",
  ],
  authors: [{ name: "Luz Torres" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Luz Torres · Asesora Inmobiliaria",
    title: "Luz Torres · Asesora Inmobiliaria",
    description:
      "Compra, venta y renta de propiedades en México con un proceso ordenado de principio a fin.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
