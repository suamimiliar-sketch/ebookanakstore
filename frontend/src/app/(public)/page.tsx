import { Hero } from "@/components/sections/Hero";
import { WhyBuy } from "@/components/sections/WhyBuy";
import { FAQ } from "@/components/sections/FAQ";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { SocialProof } from "@/components/sections/SocialProof";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { faqJsonLd } from "@/lib/jsonld";

const homeFaqs = [
  { question: "Bagaimana cara mendapatkan ebooknya?", answer: "Setelah pembayaran berhasil, link download akan otomatis dikirim ke email kamu." },
  { question: "Apakah ebooknya bisa dicetak?", answer: "Ya, semua ebook dibuat dalam format PDF A4 siap cetak di rumah atau percetakan." },
  { question: "Apakah ebooknya bisa dibuka di HP?", answer: "Ya, semua ebook bisa dibuka di HP, tablet, dan laptop karena formatnya PDF standar." },
  { question: "Diskon bundle seperti apa?", answer: "Beli 5 produk atau lebih di keranjang, otomatis dapat diskon 20%." },
  { question: "Bagaimana kalau belum terima email setelah bayar?", answer: "Cek folder Spam/Promotions dulu. Kalau belum ada dalam 15 menit, WhatsApp kami dan kami kirim manual." },
];

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(homeFaqs)) }}
      />
      <Hero />
      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">Populer minggu ini</h2>
          <Link href="/katalog">
            <Button variant="outline" size="sm">Lihat semua →</Button>
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
      <SocialProof />
      <WhyBuy />
      <FAQ />
    </>
  );
}
