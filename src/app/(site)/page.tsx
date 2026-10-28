import { Hero } from "@/components/site/Hero";
import { FeaturedSection } from "@/components/site/FeaturedSection";
import { HomeJourney } from "@/components/site/HomeJourney";
import { CtaSection } from "@/components/site/CtaSection";
import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProperties, getPropertyBySlug, getSeoIndex } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/supabase/config";
import { allCategoryPaths } from "@/lib/seo";
import { serializeJsonLd } from "@/lib/json-ld";

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
  const [featured, alpes, index] = await Promise.all([
    getFeaturedProperties(6),
    getPropertyBySlug("departamento-venta-los-alpes-alvaro-obregon-iap7712491"),
    getSeoIndex(),
  ]);
  const categoryPaths = new Set(allCategoryPaths(index));
  const localLinks = [
    { path: "/propiedades/venta/departamentos/alvaro-obregon", label: "Departamentos en venta en Álvaro Obregón" },
    { path: "/propiedades/venta/casas/chicoloapan", label: "Casas en venta en Chicoloapan" },
  ].filter((link) => categoryPaths.has(link.path));
  const selection = [
    ...(alpes ? [alpes] : []),
    ...featured.filter((p) => p.id !== alpes?.id),
  ].slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Hero properties={selection} />
      <FeaturedSection properties={selection} />
      {localLinks.length > 0 && (
        <section className="lt-container mt-12">
          <h2 className="text-xl font-semibold">Explora propiedades en venta por zona</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {localLinks.map((link) => (
              <Link key={link.path} href={link.path} className="chip">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}
      <HomeJourney />
      <CtaSection />
      <div className="pb-10" />
    </>
  );
}
