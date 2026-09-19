import { Hero } from "@/components/site/Hero";
import { FeaturedSection } from "@/components/site/FeaturedSection";
import { HomeJourney } from "@/components/site/HomeJourney";
import { CtaSection } from "@/components/site/CtaSection";
import type { Metadata } from "next";
import { getFeaturedProperties, getPropertyBySlug } from "@/lib/data";
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
  const [featured, alpes] = await Promise.all([
    getFeaturedProperties(6),
    getPropertyBySlug("departamento-venta-los-alpes-alvaro-obregon-iap7712491"),
  ]);
  const selection = [
    ...(alpes ? [alpes] : []),
    ...featured.filter((p) => p.id !== alpes?.id),
  ].slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero properties={selection} />
      <FeaturedSection properties={selection} />
      <HomeJourney />
      <CtaSection />
      <div className="pb-10" />
    </>
  );
}
