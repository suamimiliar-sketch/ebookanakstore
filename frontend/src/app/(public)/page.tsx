import { Hero } from "@/components/sections/Hero";
import { WhyBuy } from "@/components/sections/WhyBuy";
import { FAQ } from "@/components/sections/FAQ";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export default async function HomePage() {
  let featured = [] as Awaited<ReturnType<typeof api.listProducts>>;
  try {
    featured = (await api.listProducts({ type: "ebook" })).slice(0, 8);
  } catch {
    featured = [];
  }

  return (
    <>
      <Hero />
      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">Populer minggu ini</h2>
          <Link href="/katalog"><Button variant="outline" size="sm">Lihat semua →</Button></Link>
        </div>
        <ProductGrid products={featured} />
      </section>
      <WhyBuy />
      <FAQ />
    </>
  );
}
