"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface CartItem {
  productId: number;
  productType: Product["product_type"];
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string | null;
}

interface CartState {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === p.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                productId: p.id,
                productType: p.product_type,
                title: p.title,
                price: p.price,
                quantity: 1,
                thumbnail: p.thumbnail_url || p.pages?.[0]?.image_url || null,
              },
            ],
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === id ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: "ebookanak-cart" },
  ),
);
