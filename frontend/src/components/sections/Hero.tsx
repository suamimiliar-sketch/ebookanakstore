import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-100/60 via-cream to-cream" />
      <div className="container grid gap-10 py-14 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center">
          <Badge className="mb-4 w-fit">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Lebih dari 40 produk digital
          </Badge>
          <h1 className="font-display text-4xl leading-[1.05] md:text-6xl">
            Belajar jadi seru,<br />
            anak jadi <span className="text-brand-500">lebih percaya diri</span>.
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink/70 md:text-lg">
            Ebook edukatif, flashcard, tracing book, dan mini-game — dirancang untuk anak
            Indonesia usia 3–9 tahun. Download sekali, pakai berkali-kali.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/katalog"><Button size="lg">Lihat Katalog</Button></Link>
            <Link href="/katalog?type=minigame"><Button size="lg" variant="outline">Coba Mini Game</Button></Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-4 text-sm text-ink/60">
            <li>✓ Cetak sendiri</li>
            <li>✓ Bayar sekali</li>
            <li>✓ Kirim langsung ke email</li>
          </ul>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            {[
              { c: "#FFE8D1", t: "Alphabet", e: "🔤" },
              { c: "#E3F2FD", t: "Numbers", e: "🔢" },
              { c: "#F1F8E9", t: "Animals", e: "🐘" },
              { c: "#FCE4EC", t: "Feelings", e: "💗" },
            ].map((card, i) => (
              <div
                key={i}
                style={{ background: card.c }}
                className="aspect-[4/5] rounded-3xl p-5 shadow-soft transition hover:-translate-y-1"
              >
                <div className="text-3xl">{card.e}</div>
                <div className="mt-auto pt-20 font-display text-lg">{card.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
