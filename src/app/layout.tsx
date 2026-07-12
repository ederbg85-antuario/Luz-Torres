import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/supabase/config";
import { GTM_ID } from "@/lib/constants";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
      <body>
        {GTM_ID && (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
