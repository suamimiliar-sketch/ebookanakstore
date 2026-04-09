"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatIDR } from "@/lib/utils";
import type { Order, Product } from "@/types";

export default function AdminOverview() {
  const token = useAuth((s) => s.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!token) return;
    api.admin.listProducts(token).then(setProducts).catch(() => {});
    api.admin.listOrders(token).then(setOrders).catch(() => {});
  }, [token]);

  const revenue = orders
    .filter((o) => o.payment_status === "success")
    .reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Total Produk", value: products.length },
    { label: "Produk Aktif", value: products.filter((p) => p.is_active).length },
    { label: "Total Pesanan", value: orders.length },
    { label: "Revenue", value: formatIDR(revenue) },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">Overview</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-ink/50">{s.label}</div>
            <div className="mt-2 font-display text-2xl">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl">Pesanan terbaru</h2>
      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map((o) => (
              <tr key={o.id} className="border-b border-ink/5">
                <td className="p-4 font-mono text-xs">{o.order_id}</td>
                <td className="p-4">{o.customer_name}</td>
                <td className="p-4">{formatIDR(o.total)}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      o.payment_status === "success"
                        ? "bg-green-100 text-green-700"
                        : o.payment_status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {o.payment_status}
                  </span>
                </td>
                <td className="p-4 text-ink/60">{new Date(o.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ink/50">
                  Belum ada pesanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
