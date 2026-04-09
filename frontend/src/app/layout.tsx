import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "ebookanak.store — Ebook Edukasi Anak", template: "%s · ebookanak.store" },
  description: "Ebook & mini-game edukatif untuk anak Indonesia. Usia 3-9 tahun.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/icons/icon-192.png" },
  openGraph: {
    title: "ebookanak.store",
    description: "Ebook & mini-game edukatif untuk anak Indonesia",
    url: "https://ebookanak.store",
    siteName: "ebookanak.store",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f04c02",
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
