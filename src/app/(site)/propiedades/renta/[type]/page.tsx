import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/site/CategoryView";
import { loadCategory } from "@/lib/category-loader";
import { getSeoIndex } from "@/lib/data";
import { categoryMetadata, typeParams } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  return typeParams(await getSeoIndex(), "renta");
}

const load = (params: Promise<{ type: string }>) =>
  params.then(({ type }) => loadCategory({ operation: "renta", typeSlug: type }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const c = await load(params);
  if (!c) return {};
  return categoryMetadata(c.descriptor, c.properties.length, c.minPrice);
}

export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>;
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
