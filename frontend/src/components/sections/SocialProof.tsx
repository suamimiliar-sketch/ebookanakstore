import { Star, Users, Download } from "lucide-react";

/**
 * Social proof section — stats row + testimonial cards.
 *
 * TODO: replace the placeholder testimonials with real reviews from your
 * customers. Pull these from Gmail, WhatsApp, or Etsy reviews and swap the
 * `testimonials` array below. Avatars use initials so no images are required.
 */

type Stat = {
  icon: typeof Star;
  value: string;
  label: string;
};

const stats: Stat[] = [
  { icon: Star, value: "4.9 / 5", label: "Rating dari orang tua" },
  { icon: Users, value: "2.500+", label: "Keluarga Indonesia" },
  { icon: Download, value: "10.000+", label: "Ebook terdownload" },
];

type Testimonial = {
  name: string;
  role: string;
  body: string;
  city: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Bunda Sari",
    role: "Ibu dari 2 anak",
    city: "Jakarta",
    body:
      "Anak saya yang tadinya malas belajar jadi antusias banget sama ebook tracingnya. Dibuka di tablet juga jelas. Worth it banget.",
  },
  {
    name: "Bunda Ayu",
    role: "Guru PAUD & ibu",
    city: "Bandung",
    body:
      "Sudah beli 8 ebook Pelangi Pintar, semuanya saya pakai di kelas. Materinya runut, gambarnya lucu, dan harganya masuk akal.",
  },
  {
    name: "Pak Rizal",
    role: "Ayah dari Zahra (5 thn)",
    city: "Surabaya",
    body:
      "Download cepat, link masuk email dalam hitungan menit. Anak saya paling suka yang bagian angka dan hewan. Pasti beli lagi.",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function SocialProof() {
  return (
    <section className="container py-16">
      {/* Stats row */}
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-3xl bg-white p-5 shadow-sm"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-ink-soft">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl leading-tight">{s.value}</div>
              <div className="text-xs text-ink/60">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Headline */}
      <h2 className="mx-auto mt-14 max-w-xl text-center font-display text-3xl md:text-4xl">
        Dipercaya{" "}
        <span className="text-brand-500">ribuan keluarga</span>{" "}
        Indonesia
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-ink/60">
        Kata Bunda & Ayah tentang ebook Pelangi Pintar.
      </p>

      {/* Testimonials */}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex text-brand-500" aria-label="5 bintang">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-ink/80">
              &ldquo;{t.body}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-ink/5 pt-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-200 font-display text-sm text-ink-soft">
                {initials(t.name)}
              </div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-ink/60">
                  {t.role} · {t.city}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
