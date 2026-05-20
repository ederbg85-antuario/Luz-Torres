import { Hero } from "@/components/site/Hero";
import { ServicesSection } from "@/components/site/ServicesSection";
import { FeaturedSection } from "@/components/site/FeaturedSection";
import { ProcessSection } from "@/components/site/ProcessSection";
import { CoverageSection } from "@/components/site/CoverageSection";
import { AboutSection } from "@/components/site/AboutSection";
import { CtaSection } from "@/components/site/CtaSection";
import { getFeaturedProperties } from "@/lib/data";
import { SITE } from "@/lib/constants";

export const revalidate = 300;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Luz Torres · Asesora Inmobiliaria",
  description:
    "Asesoría inmobiliaria integral en México: compra, venta y renta de casas, departamentos, oficinas y más.",
  areaServed: "México",
  email: SITE.email,
  telephone: "+525656699894",
  knowsLanguage: "es-MX",
  priceRange: "$$",
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
