import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/site/CategoryView";
import { loadCategory } from "@/lib/category-loader";
import { categoryMetadata } from "@/lib/seo";

export const dynamicParams = false;

const load = () => loadCategory({ operation: "venta" });

export async function generateMetadata(): Promise<Metadata> {
  const c = await load();
  if (!c) return {};
  return categoryMetadata(c.descriptor, c.properties.length, c.minPrice);
}

export default async function Page() {
  const c = await load();
  if (!c) notFound();
  return (
    <CategoryView
      descriptor={c.descriptor}
      properties={c.properties}
      related={c.related}
    />
  );
}
