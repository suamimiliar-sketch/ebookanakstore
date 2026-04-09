import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, BookOpen, MessageCircle } from "lucide-react";

/**
 * Hero section — Pelangi Pintar home page.
 *
 * Composition:
 *   LEFT  — headline + subheadline + primary/secondary CTAs + quick trust ticks
 *   RIGHT — Huto mascot (centered), soft gradient blob backdrop,
 *           floating glassmorphism stat chips, animated sparkles
 *
 * All visual elements are CSS-animated (float / bob / twinkle) so no extra
 * assets are required. Swap `HERO_VISUAL` with a richer illustrated hero
 * image later when you have one — the surrounding layout stays the same.
 */

const HERO_VISUAL =
  "https://res.cloudinary.com/dkmadqhik/image/upload/v1775706505/huto_1_rubjsp.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ─── Background layers ─────────────────────────────────────── */}
      {/* warm cream gradient base */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-brand-50 via-cream to-cream" />
      {/* gold blob — top right */}
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-200/70 blur-3xl" />
      {/* sky blob — bottom left */}
      <div className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-[22rem] w-[22rem] rounded-full bg-sky-200/60 blur-3xl" />
      {/* small blush accent — mid right */}
      <div className="pointer-events-none absolute right-1/4 top-1/3 -z-10 h-48 w-48 rounded-full bg-blush/40 blur-3xl" />

      <div className="container grid items-center gap-10 py-14 md:grid-cols-12 md:gap-6 md:py-24">
        {/* ─── LEFT: copy + CTAs ─────────────────────────────────── */}
        <div className="md:col-span-6 lg:col-span-7">
          <Badge className="mb-5 w-fit">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            40+ ebook edukatif siap download
          </Badge>

          <h1 className="font-display text-4xl leading-[1.02] tracking-tight md:text-6xl lg:text-[4.5rem]">
            Belajar jadi seru,
            <br />
            anak jadi{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 text-brand-500">
                lebih percaya diri
              </span>
              {/* Highlighter stroke behind the accent phrase */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-brand-200/80 md:h-4"
              />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">
            Ebook edukatif, flashcard, dan tracing book — dirancang untuk anak
            Indonesia usia 0–8 tahun. Download sekali, pakai berkali-kali.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/katalog">
              <Button size="lg" className="shadow-soft">
                Lihat Katalog
              </Button>
            </Link>
            <a
              href="https://wa.me/6285664144031"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Tanya via WhatsApp
              </Button>
            </a>
          </div>

          {/* Trust ticks */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/60">
            <li className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-ink">
                ✓
              </span>{" "}
              Cetak sendiri
            </li>
            <li className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-ink">
                ✓
              </span>{" "}
              Bayar sekali
            </li>
            <li className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-ink">
                ✓
              </span>{" "}
              Kirim ke email
            </li>
          </ul>
        </div>

        {/* ─── RIGHT: mascot stage ──────────────────────────────── */}
        <div className="relative md:col-span-6 lg:col-span-5">
          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
            {/* Soft circular spotlight */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-brand-100 via-cream to-sky-100 blur-2xl" />
            {/* Inner glow ring */}
            <div className="absolute inset-10 rounded-full border border-brand-300/40 animate-pulse-soft" />

            {/* Twinkling sparkles around the mascot */}
            <Sparkles
              className="absolute left-4 top-8 h-8 w-8 animate-twinkle text-brand-500"
              aria-hidden="true"
            />
            <Sparkles
              className="absolute right-10 top-16 h-5 w-5 animate-float text-amber"
              aria-hidden="true"
            />
            <Star
              className="absolute right-6 bottom-24 h-6 w-6 animate-twinkle fill-brand-400 text-brand-400"
              aria-hidden="true"
            />
            <Sparkles
              className="absolute left-14 bottom-12 h-6 w-6 animate-float-slow text-brand-400"
              aria-hidden="true"
            />

            {/* Huto — main hero visual */}
            <div className="relative z-10 animate-bob">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_VISUAL}
                alt="Huto — maskot Pelangi Pintar"
                className="h-64 w-64 object-contain drop-shadow-[0_30px_60px_rgba(43,79,110,0.25)] md:h-80 md:w-80 lg:h-[22rem] lg:w-[22rem]"
              />
            </div>

            {/* Floating glassmorphism chip — rating (top-left) */}
            <div className="absolute left-0 top-8 z-20 hidden animate-float rounded-2xl bg-white/90 p-3 pr-4 shadow-float backdrop-blur-md sm:flex md:left-[-1rem] lg:left-[-2rem]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100">
                  <Star className="h-5 w-5 fill-brand-500 text-brand-500" />
                </div>
                <div>
                  <div className="font-display text-lg leading-none text-ink">
                    4.9 / 5
                  </div>
                  <div className="mt-1 text-[11px] text-ink/60">
                    2.500+ orang tua
                  </div>
                </div>
              </div>
            </div>

            {/* Floating glassmorphism chip — ebook count (bottom-right) */}
            <div className="absolute bottom-8 right-0 z-20 hidden animate-float-slow rounded-2xl bg-white/90 p-3 pr-4 shadow-float backdrop-blur-md sm:flex md:right-[-1rem] lg:right-[-2rem]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100">
                  <BookOpen className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <div className="font-display text-lg leading-none text-ink">
                    40+ ebook
                  </div>
                  <div className="mt-1 text-[11px] text-ink/60">
                    Usia 0–8 tahun
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
