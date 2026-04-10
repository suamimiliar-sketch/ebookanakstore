/**
 * Meta Pixel event helpers for e-commerce tracking.
 * Call these from client components on user actions.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

/** Fires on product detail page view */
export function trackViewContent(product: {
  id: number;
  title: string;
  price: number;
  category: string;
}) {
  fbq("track", "ViewContent", {
    content_name: product.title,
    content_ids: [String(product.id)],
    content_type: "product",
    content_category: product.category,
    value: product.price,
    currency: "IDR",
  });
}

/** Fires when user adds item to cart */
export function trackAddToCart(product: {
  id: number;
  title: string;
  price: number;
  category: string;
}) {
  fbq("track", "AddToCart", {
    content_name: product.title,
    content_ids: [String(product.id)],
    content_type: "product",
    value: product.price,
    currency: "IDR",
  });
}

/** Fires on successful purchase */
export function trackPurchase(orderId: string, total: number, items: { id: number }[]) {
  fbq("track", "Purchase", {
    content_ids: items.map((i) => String(i.id)),
    content_type: "product",
    value: total,
    currency: "IDR",
    order_id: orderId,
  });
}
