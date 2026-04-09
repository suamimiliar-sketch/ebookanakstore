"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatIDR } from "@/lib/utils";
import type { Product } from "@/types";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

type Draft = Partial<Product> & { pages?: Product["pages"] };

const EMPTY: Draft = {
  product_type: "ebook",
  title: "",
  category: "",
  age_group: "3-4",
  description: "",
  price: 10000,
  is_active: true,
  pages: [],
};

export default function AdminProductsPage() {
  const token = useAuth((s) => s.token);
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Draft | null>(null);

  const load = () => {
    if (!token) return;
    api.admin.listProducts(token).then(setItems).catch((e) => toast.error(e.message));
  };
  useEffect(load, [token]);

  async function save() {
    if (!editing || !token) return;
    try {
      if (editing.id) {
        await api.admin.updateProduct(token, editing.id, editing);
        toast.success("Produk diperbarui");
      } else {
        await api.admin.createProduct(token, editing);
        toast.success("Produk dibuat");
      }
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function remove(id: number) {
    if (!token || !confirm("Hapus produk ini?")) return;
    await api.admin.deleteProduct(token, id);
    toast.success("Dihapus");
    load();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl">Produk</h1>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="p-4">Judul</th>
              <th className="p-4">Tipe</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-ink/60">{p.product_type}</td>
                <td className="p-4 text-ink/60">{p.category}</td>
                <td className="p-4">{formatIDR(p.price)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-1 text-xs ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.is_active ? "aktif" : "nonaktif"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} className="mr-2 inline-grid h-8 w-8 place-items-center rounded-lg hover:bg-cream">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(p.id)} className="inline-grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">{editing.id ? "Edit produk" : "Produk baru"}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Judul
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">Tipe
                  <select
                    value={editing.product_type}
                    onChange={(e) => setEditing({ ...editing, product_type: e.target.value as any })}
                    className="mt-1 h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm"
                  >
                    <option value="ebook">Ebook</option>
                    <option value="ebook_exclusive">Ebook Exclusive</option>
                    <option value="minigame">Mini Game</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">Usia
                  <Input value={editing.age_group || ""} onChange={(e) => setEditing({ ...editing, age_group: e.target.value })} />
                </label>
              </div>
              <label className="block text-sm font-medium">Kategori
                <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </label>
              <label className="block text-sm font-medium">Harga (IDR)
                <Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </label>
              <label className="block text-sm font-medium">Deskripsi
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </label>
              <label className="block text-sm font-medium">Google Drive Link
                <Input value={editing.drive_download_link || ""} onChange={(e) => setEditing({ ...editing, drive_download_link: e.target.value })} />
              </label>
              <label className="block text-sm font-medium">Thumbnail URL
                <Input value={editing.thumbnail_url || ""} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_active ?? true}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                Aktif
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
              <Button onClick={save}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
