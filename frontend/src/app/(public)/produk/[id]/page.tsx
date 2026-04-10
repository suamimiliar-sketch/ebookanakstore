import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { AddToCartButton } from "@/components/sections/AddToCartButton";
import { formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

const SITE = "https://ebookanak.store";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const p = await api.getProduct(Number(params.id));
    const title = p.title;
    const desc = `${p.title} — ebook edukasi anak ${p.age_label || `usia ${p.age_group}`}. Kategori: ${p.category}. Format PDF siap cetak. Harga ${formatIDR(p.price)}.`;
    return {
      title,
      description: desc,
      openGraph: {
        title: `${title} · Pelangi Pintar`,
        description: desc,
        url: `${SITE}/produk/${p.id}`,
        type: "website",
        images: p.thumbnail_url ? [{ url: p.thumbnail_url, alt: title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} · Pelangi Pintar`,
        description: desc,
        images: p.thumbnail_url ? [p.thumbnail_url] : [],
      },
      alternates: {
        canonical: `${SITE}/produk/${p.id}`,
      },
    };
  } catch {
    return { title: "Produk Tidak Ditemukan" };
  }
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  let product;
  try {
    product = await api.getProduct(Number(params.id));
  } catch {
    notFound();
  }
  if (!product) notFound();

  const cover =
    product.thumbnail_url || product.pages?.[0]?.image_url || null;

  const breadcrumbs = [
    { name: "Beranda", url: SITE },
    { name: "Katalog", url: `${SITE}/katalog` },
    { name: product.category, url: `${SITE}/katalog?category=${encodeURIComponent(product.category)}` },
    { name: product.title },
  ];

  return (
    <div className="container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />

      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/50">
        <ol className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((b, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {b.url ? (
                <a href={b.url} className="hover:text-brand-500 transition-colors">
                  {b.name}
                </a>
              ) : (
                <span className="text-ink/80">{b.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div
          className="aspect-[4/5] overflow-hidden rounded-3xl"
          style={{ background: product.cover_color || "#fff3e0" }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-6xl">
              📘
            </div>
          )}
        </div>
        <div>
          <Badge>{product.category}</Badge>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            {product.title}
          </h1>
          <p className="mt-3 text-ink/60">
            {product.age_label || `Usia ${product.age_group}`}
          </p>
          <p className="mt-6 text-base text-ink/80">{product.description}</p>
          <div className="mt-8 flex items-center gap-4">
            <span className="font-display text-3xl">
              {formatIDR(product.price)}
            </span>
            <AddToCartButton product={product} />
          </div>
          {product.pages && product.pages.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-3 font-semibold">Preview halaman</h3>
              <div className="grid grid-cols-3 gap-3">
                {product.pages.slice(0, 3).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.page_number}
                    src={p.image_url || ""}
                    alt={`${product.title} halaman ${p.page_number}`}
                    className="aspect-[3/4] w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
