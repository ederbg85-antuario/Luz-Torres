import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/site/CategoryView";
import { loadCategory } from "@/lib/category-loader";
import { getSeoIndex } from "@/lib/data";
import { categoryMetadata, ubicacionParams } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  return ubicacionParams(await getSeoIndex(), "renta");
}

const load = (params: Promise<{ type: string; ubicacion: string }>) =>
  params.then(({ type, ubicacion }) =>
    loadCategory({ operation: "renta", typeSlug: type, ubicacionSlug: ubicacion })
  );

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; ubicacion: string }>;
}): Promise<Metadata> {
  const c = await load(params);
  if (!c) return {};
  return categoryMetadata(c.descriptor, c.properties.length, c.minPrice);
}

export default async function Page({
  params,
}: {
  params: Promise<{ type: string; ubicacion: string }>;
}) {
  const c = await load(params);
  if (!c) notFound();
  return (
    <CategoryView
      descriptor={c.descriptor}
      properties={c.properties}
      related={c.related}
    />
  );
}
