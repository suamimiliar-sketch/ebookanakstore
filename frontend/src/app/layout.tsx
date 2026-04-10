import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

/**
 * Pelangi Pintar typography system
 *
 * - Fredoka (display): rounded bubble sans that echoes the chunky roundness
 *   of the Pelangi Pintar logo. Used for h1–h3, badges, and the logo
 *   wordmark contexts.
 * - Nunito (body): friendly rounded sans with excellent readability. Pairs
 *   with Fredoka and is used for paragraphs, nav, UI chrome, and buttons.
 *
 * Both are self-hosted by Next at build time via next/font/google — no
 * external CDN request, zero layout shift, optimal CLS.
 */
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ebookanak.store"),
  title: {
    default: "Pelangi Pintar — Ebook Edukasi Anak Indonesia",
    template: "%s · Pelangi Pintar",
  },
  description:
    "Ebook edukatif untuk anak Indonesia usia 0–9 tahun. Flashcard, worksheet, coloring book, dan aktivitas belajar dalam format PDF siap cetak. Download sekali, pakai berkali-kali.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/icons/icon-192.png" },
  openGraph: {
    title: "Pelangi Pintar — Ebook Edukasi Anak Indonesia",
    description:
      "Ebook edukatif untuk anak Indonesia usia 0–9 tahun. Flashcard, worksheet, coloring book, dan aktivitas belajar PDF siap cetak.",
    url: "https://ebookanak.store",
    siteName: "Pelangi Pintar",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pelangi Pintar — Ebook Edukasi Anak Indonesia",
    description:
      "Ebook edukatif untuk anak Indonesia. Flashcard, worksheet, coloring book PDF siap cetak.",
  },
  alternates: {
    canonical: "https://ebookanak.store",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
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
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
