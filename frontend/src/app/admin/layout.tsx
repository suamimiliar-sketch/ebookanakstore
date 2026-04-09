"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { Package, ShoppingBag, Settings, LogOut, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingBag },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, email, signOut } = useAuth();

  useEffect(() => {
    if (!token && pathname !== "/admin/login") router.replace("/admin/login");
  }, [token, pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!token) return null;

  return (
    <div className="flex min-h-dvh bg-cream">
      <aside className="hidden w-64 flex-col border-r border-ink/5 bg-white p-5 md:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 font-display text-lg text-white">e</span>
          <span className="font-display text-lg">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                pathname === n.href ? "bg-brand-100 text-brand-700" : "text-ink/70 hover:bg-cream",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-ink/5 pt-4">
          <div className="px-3 text-xs text-ink/50">{email}</div>
          <button
            onClick={() => {
              signOut();
              router.replace("/admin/login");
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink/70 hover:bg-cream"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
