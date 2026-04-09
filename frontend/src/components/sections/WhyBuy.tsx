import { BookOpen, Download, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  {
    icon: BookOpen,
    title: "Dirancang oleh pendidik",
    body: "Setiap ebook diuji oleh orang tua dan guru PAUD.",
  },
  {
    icon: Download,
    title: "Instant delivery",
    body: "Link download langsung masuk ke email setelah bayar.",
  },
  {
    icon: ShieldCheck,
    title: "Pembayaran aman",
    body: "Didukung Midtrans — QRIS, GoPay, OVO, transfer bank.",
  },
  {
    icon: Sparkles,
    title: "Bundle hemat",
    body: "Beli 5 produk atau lebih otomatis dapat diskon 20%.",
  },
];

export function WhyBuy() {
  return (
    <section className="container py-16">
      <h2 className="mx-auto max-w-xl text-center font-display text-3xl md:text-4xl">
        Kenapa orang tua memilih{" "}
        <span className="text-brand-500">Pelangi Pintar</span>
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-ink-soft">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg">{it.title}</h3>
            <p className="mt-1 text-sm text-ink/60">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
