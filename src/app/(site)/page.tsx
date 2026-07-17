import { Hero } from "@/components/site/Hero";
import { ServicesSection } from "@/components/site/ServicesSection";
import { FeaturedSection } from "@/components/site/FeaturedSection";
import { ProcessSection } from "@/components/site/ProcessSection";
import { CoverageSection } from "@/components/site/CoverageSection";
import { AboutSection } from "@/components/site/AboutSection";
import { CtaSection } from "@/components/site/CtaSection";
import type { Metadata } from "next";
import { getFeaturedProperties } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/supabase/config";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${SITE_URL}/#agent`,
  name: "Luz Torres · Asesora Inmobiliaria",
  description:
    "Asesoría inmobiliaria integral en México: compra, venta y renta de casas, departamentos, oficinas y más.",
  url: SITE_URL,
  image: `${SITE_URL}/luz-keys.jpg`,
  telephone: "+525656699894",
  email: SITE.email,
  knowsLanguage: "es-MX",
  priceRange: "$$",
  sameAs: [SITE.instagramUrl],
  areaServed: [
    "Ciudad de México",
    "Estado de México",
    "Hidalgo",
    "Morelos",
    "Guerrero",
  ].map((name) => ({ "@type": "AdministrativeArea", name })),
  address: {
    "@type": "PostalAddress",
    addressCountry: "MX",
  },
};

export default async function HomePage() {
  const featured = await getFeaturedProperties(6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ServicesSection />
      <FeaturedSection properties={featured} />
      <ProcessSection />
      <CoverageSection />
      <AboutSection />
      <CtaSection />
      <div className="pb-10" />
    </>
  );
}
