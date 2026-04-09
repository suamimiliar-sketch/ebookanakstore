"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types";
import { toast } from "sonner";

export function AddToCartButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  return (
    <Button
      size="lg"
      onClick={() => {
        add(product);
        toast.success("Ditambahkan ke keranjang");
      }}
    >
      Tambah ke Keranjang
    </Button>
  );
}
