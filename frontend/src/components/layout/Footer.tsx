import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-white safe-bottom">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl">ebookanak<span className="text-brand-500">.</span>store</h3>
          <p className="mt-3 max-w-sm text-sm text-ink/70">
            Ebook edukasi dan mini-game untuk anak Indonesia. Ringan, seru, dan ramah orang tua.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Jelajahi</h4>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="/katalog">Katalog</Link></li>
            <li><Link href="/katalog?type=minigame">Mini Game</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Bantuan</h4>
          <ul className="space-y-2 text-sm text-ink/70">
            <li>WhatsApp: <a href="https://wa.me/628000000000">0800-0000-000</a></li>
            <li>Email: halo@ebookanak.store</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/5">
        <div className="container py-4 text-xs text-ink/50">
          © {new Date().getFullYear()} ebookanak.store — Produk BMO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
