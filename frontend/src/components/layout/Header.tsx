"use client";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";

// Pelangi Pintar logo assets (hosted on Cloudinary)
// TODO: swap LOGO_DEFAULT with the non-hover (dark) variant when the URL is available.
const LOGO_DEFAULT =
  "https://res.cloudinary.com/dkmadqhik/image/upload/v1775706498/logo_pelangi_pintar_hover-min_jxjqbq.png";
const LOGO_HOVER =
  "https://res.cloudinary.com/dkmadqhik/image/upload/v1775706498/logo_pelangi_pintar_hover-min_jxjqbq.png";

const nav = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.count());

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/85 backdrop-blur safe-top">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative inline-block h-11 w-11">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_DEFAULT}
              alt="Pelangi Pintar"
              className="absolute inset-0 h-full w-full object-contain transition-opacity duration-200 group-hover:opacity-0"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_HOVER}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          </span>
          <span className="font-display text-xl leading-none">
            Pelangi <span className="text-brand-500">Pintar</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-ink/80 hover:text-brand-600"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/checkout"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"
            aria-label="Keranjang"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink/5 bg-cream md:hidden">
          <ul className="container flex flex-col py-2">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="block py-3 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
