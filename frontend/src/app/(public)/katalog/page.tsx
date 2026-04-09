import { api } from "@/lib/api";
import { ProductGrid } from "@/components/sections/ProductGrid";

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

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl">Katalog</h1>
        <p className="mt-2 text-ink/60">Temukan ebook, flashcard, dan produk digital edukatif favorit si kecil.</p>
      </header>
      <ProductGrid products={products} />
    </div>
  );
}
