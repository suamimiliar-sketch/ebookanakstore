"use client";
import { useEffect } from "react";
import { trackViewContent } from "@/lib/pixel-events";

export function TrackViewContent({
  product,
}: {
  product: { id: number; title: string; price: number; category: string };
}) {
  useEffect(() => {
    trackViewContent(product);
  }, [product]);
  return null;
}
