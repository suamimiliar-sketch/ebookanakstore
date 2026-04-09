import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const HUTO_MASCOT =
  "https://res.cloudinary.com/dkmadqhik/image/upload/v1775706505/huto_1_rubjsp.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* warm gold → cream gradient canvas */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-100 via-cream to-cream" />
      {/* soft sky blue glow in the corner — brand warm/cool balance */}
      <div className="absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

      <div className="container grid gap-10 py-14 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center">
          <Badge className="mb-4 w-fit">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> 40+ ebook edukatif siap download
          </Badge>
          <h1 className="font-display text-4xl leading-[1.05] md:text-6xl">
            Belajar jadi seru,
            <br />
            anak jadi{" "}
            <span className="text-brand-500">lebih percaya diri</span>.
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink/70 md:text-lg">
            Ebook edukatif, flashcard, dan tracing book — dirancang untuk anak
            Indonesia usia 0–8 tahun. Download sekali, pakai berkali-kali.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/katalog">
              <Button size="lg">Lihat Katalog</Button>
            </Link>
            <a
              href="https://wa.me/6285664144031"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline">Tanya via WhatsApp</Button>
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-4 text-sm text-ink/60">
            <li>✓ Cetak sendiri</li>
            <li>✓ Bayar sekali</li>
            <li>✓ Kirim langsung ke email</li>
          </ul>
        </div>

        {/* Huto mascot + themed category cards */}
        <div className="relative">
          <div className="pointer-events-none absolute -left-4 top-0 z-10 hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HUTO_MASCOT}
              alt="Huto — maskot Pelangi Pintar"
              className="h-44 w-44 drop-shadow-[0_20px_40px_rgba(43,79,110,0.25)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { c: "#FFE184", t: "Alphabet", e: "🔤" },
              { c: "#D6EEF8", t: "Numbers", e: "🔢" },
              { c: "#FFB8B8", t: "Animals", e: "🐘" },
              { c: "#F5EFE0", t: "Feelings", e: "💗" },
            ].map((card, i) => (
              <div
                key={i}
                style={{ background: card.c }}
                className="aspect-[4/5] rounded-3xl p-5 shadow-soft transition hover:-translate-y-1"
              >
                <div className="text-3xl">{card.e}</div>
                <div className="mt-auto pt-20 font-display text-lg text-ink">
                  {card.t}
                </div>
              </div>
            ))}
          </div>
          {/* Mobile Huto — sits under the grid so it doesn't overlap text */}
          <div className="mt-6 flex justify-center md:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HUTO_MASCOT}
              alt="Huto — maskot Pelangi Pintar"
              className="h-32 w-32"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
