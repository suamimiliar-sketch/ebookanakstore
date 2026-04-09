import Link from "next/link";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { Sparkles, Gift, ArrowRight } from "lucide-react";

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

      {/* Promo banner — bundle ekslusif */}
      {showExclusive && exclusive.length > 0 && (
        <Link
          href="/katalog?type=ebook_exclusive"
          className="group relative mb-10 block overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 p-1 shadow-xl transition hover:shadow-2xl"
        >
          <div className="relative flex flex-col items-start gap-6 rounded-[22px] bg-gradient-to-br from-rose-500/90 via-fuchsia-600/90 to-indigo-600/90 p-6 text-white md:flex-row md:items-center md:gap-10 md:p-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur md:h-20 md:w-20">
              <Gift className="h-8 w-8 md:h-10 md:w-10" />
            </div>

            <div className="relative flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                <Sparkles className="h-3 w-3" /> Bundle Eksklusif
              </span>
              <h2 className="mt-3 font-display text-2xl leading-tight md:text-4xl">
                Hemat Lebih Banyak dengan Premium Bundle!
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
                Ratusan halaman aktivitas, worksheet & flashcard dalam satu paket lengkap.
                Hanya <span className="font-bold">Rp 35.000</span> per bundle — cocok untuk semua usia.
              </p>
            </div>

            <div className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-fuchsia-700 shadow-lg transition group-hover:translate-x-1">
              Lihat Bundle <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      )}

      {/* Section: Ebook Eksklusif */}
      {showExclusive && exclusive.length > 0 && (
        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-700">
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
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/15 to-transparent" />
          <span className="rounded-full border border-ink/10 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wider text-ink/50">
            Ebook Reguler
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/15 to-transparent" />
        </div>
      )}

      {/* Section: Ebook Reguler */}
      {showRegular && regular.length > 0 && (
        <section>
          {!showExclusive && (
            <div className="mb-5">
              <h2 className="font-display text-2xl md:text-3xl">Ebook Reguler</h2>
              <p className="text-sm text-ink/60">Pilih per judul sesuai usia & kebutuhan si kecil.</p>
            </div>
          )}
          <ProductGrid products={regular} />
        </section>
      )}

      {products.length === 0 && (
        <p className="py-16 text-center text-ink/50">Belum ada produk.</p>
      )}
    </div>
  );
}
