/**
 * JSON-LD structured data builders for SEO + AI search (GEO/AEO).
 *
 * Covers: Organization, WebSite (with SearchAction), Product, BreadcrumbList, FAQPage.
 * All schema follows https://schema.org and Google's structured data guidelines.
 */
import type { Product } from "@/types";

const SITE = "https://ebookanak.store";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pelangi Pintar",
    alternateName: "ebookanak.store",
    url: SITE,
    logo: `${SITE}/icons/icon-512.png`,
    description:
      "Pelangi Pintar menyediakan ebook edukasi anak Indonesia usia 0–9 tahun. Flashcard, worksheet, coloring book, dan aktivitas belajar dalam format PDF siap cetak.",
    foundingDate: "2024",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Indonesian", "English"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pelangi Pintar",
    alternateName: "Ebook Anak Store",
    url: SITE,
    inLanguage: "id",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/katalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.thumbnail_url || undefined,
    sku: `EBK-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Pelangi Pintar",
    },
    category: product.category,
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge: product.age_group?.split("-")[0] || "3",
      suggestedMaxAge: product.age_group?.split("-")[1] || "9",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE}/produk/${product.id}`,
      priceCurrency: "IDR",
      price: product.price,
      availability: product.is_active
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Pelangi Pintar",
      },
    },
    isAccessibleForFree: false,
    inLanguage: "id",
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function collectionJsonLd(
  name: string,
  description: string,
  products: Product[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE}/katalog`,
    numberOfItems: products.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/produk/${p.id}`,
        name: p.title,
      })),
    },
  };
}
