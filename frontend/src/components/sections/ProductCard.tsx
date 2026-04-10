"use client";
import Link from "next/link";
import type { Product } from "@/types";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { trackAddToCart } from "@/lib/pixel-events";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const cover = product.thumbnail_url || product.pages?.[0]?.image_url || null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/produk/${product.id}`} className="block">
        <div
          className="aspect-[4/5] w-full overflow-hidden"
          style={{ background: product.cover_color || "#fff3e0" }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-5xl">📘</div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-[11px] uppercase tracking-wide text-brand-600">
          {product.category}
        </div>
        <Link href={`/produk/${product.id}`} className="line-clamp-2 font-display text-base leading-tight">
          {product.title}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-semibold">{formatIDR(product.price)}</span>
          <Button
            size="sm"
            onClick={() => {
              add(product);
              trackAddToCart(product);
              toast.success("Ditambahkan ke keranjang");
            }}
          >
            + Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
}
