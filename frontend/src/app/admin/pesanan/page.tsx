"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import type { Order } from "@/types";
import { formatIDR } from "@/lib/utils";

export default function AdminOrdersPage() {
  const token = useAuth((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!token) return;
    api.admin.listOrders(token).then(setOrders).catch(() => {});
  }, [token]);

  const visible = orders.filter((o) => filter === "all" || o.payment_status === filter);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">Pesanan</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "pending", "success", "failed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === f ? "bg-brand-500 text-white" : "bg-white text-ink/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Item</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id} className="border-b border-ink/5">
                <td className="p-4 font-mono text-xs">{o.order_id}</td>
                <td className="p-4">{o.customer_name}</td>
                <td className="p-4 text-ink/60">{o.customer_email}</td>
                <td className="p-4">{o.items.length}</td>
                <td className="p-4">{formatIDR(o.total)}</td>
                <td className="p-4">{o.payment_status}</td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink/50">Tidak ada pesanan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
