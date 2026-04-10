import type { MetadataRoute } from "next";
import { api } from "@/lib/api";

const SITE = "https://ebookanak.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/katalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await api.listProducts();
    productPages = products.map((p) => ({
      url: `${SITE}/produk/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    productPages = [];
  }

  return [...staticPages, ...productPages];
}
