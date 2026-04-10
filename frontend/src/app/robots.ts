import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/checkout", "/api/"],
      },
    ],
    sitemap: "https://ebookanak.store/sitemap.xml",
  };
}
