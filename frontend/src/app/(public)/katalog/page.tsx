import { api } from "@/lib/api";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { Sparkles, ShoppingCart } from "lucide-react";

export const revalidate = 120;

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: { type?: string; age?: string; q?: string };
}) {
  const params: Record<string, string> = {};
  if (searchParams.type) params.type = searchParams.type;
  if (searchParams.age) params.age = searchParams.age;
  if (searchParams.q) params.q = searchParams.q;

  let products = [] as Awaited<ReturnType<typeof api.listProducts>>;
  try {
    products = await api.listProducts(params);
  } catch {
    products = [];
  }

  const exclusive = products.filter((p) => p.product_type === "ebook_exclusive");
  const regular = products.filter((p) => p.product_type !== "ebook_exclusive");

  const showExclusive = !searchParams.type || searchParams.type === "ebook_exclusive";
  const showRegular = !searchParams.type || searchParams.type === "ebook";

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl">Katalog</h1>
        <p className="mt-2 text-ink/60">
          Temukan ebook, flashcard, dan produk digital edukatif favorit si kecil.
        </p>
      </header>

      {/* Promo banner — diskon 20% beli 5+ */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-500 via-amber to-brand-400 p-[2px]">
        <div className="relative flex flex-col items-center gap-4 rounded-[22px] bg-gradient-to-r from-brand-500 via-amber to-brand-400 px-6 py-6 text-center md:flex-row md:gap-6 md:px-10 md:py-8 md:text-left">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/25 backdrop-blur md:h-16 md:w-16">
            <ShoppingCart className="h-7 w-7 text-ink md:h-8 md:w-8" />
          </div>

          <div className="relative flex-1">
            <h2 className="font-display text-xl leading-tight text-ink md:text-2xl">
              Makin Banyak, Makin Hemat!
            </h2>
            <p className="mt-1 text-sm text-ink/80 md:text-base">
              Tambahkan <span className="font-bold text-ink">5 produk atau lebih</span> ke keranjang
              dan nikmati <span className="font-bold text-ink">diskon 20% otomatis</span> — tanpa kode promo.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Ebook Eksklusif */}
      {showExclusive && exclusive.length > 0 && (
        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
                <Sparkles className="h-3 w-3" /> Premium
              </span>
              <h2 className="mt-2 font-display text-2xl md:text-3xl">Ebook Eksklusif</h2>
              <p className="text-sm text-ink/60">Bundle lengkap dengan harga spesial.</p>
            </div>
            <span className="text-xs text-ink/50">{exclusive.length} produk</span>
          </div>
          <ProductGrid products={exclusive} />
        </section>
      )}

      {/* Divider */}
      {showExclusive && showRegular && exclusive.length > 0 && regular.length > 0 && (
        <div className="my-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
          <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-sky-600">
            Ebook Reguler
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
        </div>
      )}

      {/* Section: Ebook Reguler */}
      {showRegular && regular.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="font-display text-2xl md:text-3xl">Ebook Reguler</h2>
            <p className="text-sm text-ink/60">Pilih per judul sesuai usia & kebutuhan si kecil.</p>
          </div>
          <ProductGrid products={regular} />
        </section>
      )}

      {products.length === 0 && (
        <p className="py-16 text-center text-ink/50">Belum ada produk.</p>
      )}
    </div>
  );
}
