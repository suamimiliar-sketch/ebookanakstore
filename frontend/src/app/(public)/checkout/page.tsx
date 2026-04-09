"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function CheckoutPage() {
  const cart = useCart();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cart.subtotal();
  const count = cart.count();
  const bundle = count >= 5;
  const discount = bundle ? Math.floor(subtotal * 0.2) : 0;
  const total = subtotal - discount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.items.length) return;
    setLoading(true);
    try {
      const res = await api.createOrder({
        customer_email: email,
        customer_name: name,
        customer_phone: phone,
        items: cart.items.map((i) => ({
          product_id: i.productId,
          product_type: i.productType,
          quantity: i.quantity,
        })),
      });
      toast.success(`Order ${res.order_id} dibuat`);
      if (res.redirect_url) window.location.href = res.redirect_url;
      cart.clear();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-4xl">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">Data Pembeli</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Nama</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">WhatsApp (opsional)</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button size="lg" disabled={loading || !cart.items.length} className="mt-2 w-full">
            {loading ? "Memproses..." : `Bayar ${formatIDR(total)}`}
          </Button>
        </form>

        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">Pesanan</h2>
          {!cart.items.length && <p className="mt-3 text-sm text-ink/50">Keranjang kosong.</p>}
          <ul className="mt-3 divide-y divide-ink/10">
            {cart.items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                  {i.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="line-clamp-1 text-sm font-medium">{i.title}</div>
                  <div className="text-xs text-ink/60">
                    {i.quantity} × {formatIDR(i.price)}
                  </div>
                </div>
                <button onClick={() => cart.remove(i.productId)} aria-label="Remove">
                  <Trash2 className="h-4 w-4 text-ink/40" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
            {bundle && (
              <div className="flex justify-between text-brand-600">
                <span>Bundle discount 20%</span>
                <span>- {formatIDR(discount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-display text-lg">
              <span>Total</span><span>{formatIDR(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
