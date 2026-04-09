import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "Pelangi Pintar — Ebook Edukasi Anak Indonesia",
    template: "%s · Pelangi Pintar",
  },
  description:
    "Ebook edukatif untuk anak Indonesia usia 0–8 tahun. Download sekali, pakai berkali-kali. Smart, colorful, and joyful learning.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/icons/icon-192.png" },
  openGraph: {
    title: "Pelangi Pintar — Ebook Edukasi Anak",
    description:
      "Smart, colorful, and joyful learning for Indonesian children. Ebook edukatif untuk anak usia 0–8 tahun.",
    url: "https://ebookanak.store",
    siteName: "Pelangi Pintar",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFBB00", // sunshine-gold
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
