"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Bagaimana cara mendapatkan ebooknya?", a: "Setelah pembayaran berhasil, link download akan otomatis dikirim ke email kamu." },
  { q: "Apakah ebooknya bisa dicetak?", a: "Ya, semua ebook dibuat dalam format PDF A4 siap cetak di rumah atau percetakan." },
  { q: "Apakah mini-game bisa dimainkan di HP?", a: "Ya, mini-game bisa dimainkan di browser Android maupun iOS selama 24 jam setelah pembelian." },
  { q: "Diskon bundle seperti apa?", a: "Beli 5 produk atau lebih di keranjang, otomatis dapat diskon 20%." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="container py-16">
      <h2 className="mx-auto max-w-xl text-center font-display text-3xl md:text-4xl">
        Pertanyaan yang sering ditanya
      </h2>
      <div className="mx-auto mt-10 max-w-2xl divide-y divide-ink/10 rounded-3xl bg-white shadow-sm">
        {faqs.map((f, i) => (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between px-6 py-5 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-medium">{f.q}</span>
              <ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-6 pb-5 text-sm text-ink/70">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
