/**
 * Thin fetch client that talks to the FastAPI backend.
 * In the browser we go through Next's rewrite (/api/backend/*) so cookies stay
 * first-party; server-side we hit NEXT_PUBLIC_API_URL directly.
 */
import type { Order, Product } from "@/types";

const BROWSER_BASE = "/api/backend/v1";
const SERVER_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1`;

const base = () => (typeof window === "undefined" ? SERVER_BASE : BROWSER_BASE);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listProducts: (params: Record<string, string> = {}) =>
    request<Product[]>(`/products?${new URLSearchParams(params)}`),
  getProduct: (id: number) => request<Product>(`/products/${id}`),
  createOrder: (body: unknown) =>
    request<{ order_id: string; snap_token: string; total: number; redirect_url: string }>(
      `/orders`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  getOrder: (orderId: string) => request<Order>(`/orders/${orderId}`),

  admin: {
    login: (email: string, password: string) =>
      request<{ access_token: string; admin: any }>(`/admin/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    listProducts: (token: string) =>
      request<Product[]>(`/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
    createProduct: (token: string, body: unknown) =>
      request<Product>(`/admin/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }),
    updateProduct: (token: string, id: number, body: unknown) =>
      request<Product>(`/admin/products/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }),
    deleteProduct: (token: string, id: number) =>
      fetch(`${base()}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    listOrders: (token: string) =>
      request<Order[]>(`/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
  },
};
