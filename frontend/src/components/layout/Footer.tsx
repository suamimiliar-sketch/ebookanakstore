import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

// Pelangi Pintar logo (Cloudinary). Same asset the header uses.
// TODO: swap with the non-hover (dark) variant once available.
const LOGO =
  "https://res.cloudinary.com/dkmadqhik/image/upload/v1775706498/logo_pelangi_pintar_hover-min_jxjqbq.png";

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-white safe-bottom">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO}
            alt="Pelangi Pintar"
            className="h-20 w-20 object-contain md:h-24 md:w-24"
          />
          <p className="mt-4 max-w-sm text-sm text-ink/70">
            Ebook edukatif untuk anak Indonesia usia 0–8 tahun. Ringan, seru,
            dan ramah orang tua. Smart, colorful, and joyful learning.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Jelajahi</h4>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="/katalog" className="hover:text-brand-600">Katalog</Link></li>
            <li><Link href="/#faq" className="hover:text-brand-600">FAQ</Link></li>
            <li><Link href="/checkout" className="hover:text-brand-600">Keranjang</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Bantuan</h4>
          <ul className="space-y-2 text-sm text-ink/70">
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-brand-500" />
              <a
                href="https://wa.me/6285664144031"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600"
              >
                +62 856-6414-4031
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-500" />
              <a
                href="mailto:pelangipintar@ebookanak.store"
                className="hover:text-brand-600"
              >
                pelangipintar@ebookanak.store
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/5">
        <div className="container py-4 text-xs text-ink/50">
          © {new Date().getFullYear()} Pelangi Pintar — Produk BMO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
