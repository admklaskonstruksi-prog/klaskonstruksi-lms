import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import FloatingCartPublic from "@/app/components/FloatingCartPublic";

// KONFIGURASI SEO LENGKAP
export const metadata: Metadata = {
  metadataBase: new URL("https://klaskonstruksi.com"),
  title: {
    default: "KLAS : Kursus Online Konstruksi",
    template: "%s | KLAS", // Jika buka halaman E-Book, tab akan otomatis jadi "Katalog E-Book | KLAS"
  },
  description: "Platform e-learning teknik sipil dan konstruksi terlengkap. Pelajari skill teknik sipil, manajemen proyek, dan arsitektur langsung dari praktisi industri.",
  keywords: [
    "klas konstruksi", 
    "kursus online konstruksi",
    "belajar teknik sipil", 
    "kursus teknik sipil", 
    "manajemen proyek konstruksi", 
    "arsitektur", 
    "e-learning konstruksi", 
    "pelatihan teknik sipil", 
    "sertifikasi konstruksi"
  ],
  authors: [{ name: "KLAS Konstruksi" }],
  creator: "KLAS Konstruksi",
  publisher: "KLAS Konstruksi",
  
  // SEO untuk Social Media (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://klaskonstruksi.com",
    title: "KLAS : Kursus Online Konstruksi",
    description: "Bangun karir impian di dunia konstruksi bersama praktisi industri. Materi terstruktur dan 100% praktis.",
    siteName: "KLAS Konstruksi",
    images: [
      {
        url: "/logo.png", 
        width: 800,
        height: 600,
        alt: "KLAS Konstruksi",
      },
    ],
  },
  
  // SEO untuk Twitter / X
  twitter: {
    card: "summary_large_image",
    title: "KLAS : Kursus Online Konstruksi",
    description: "Platform e-learning teknik sipil dan konstruksi terlengkap di Indonesia.",
    images: ["/logo.png"],
  },

  // Perintah untuk Google Bot agar website kamu mudah dicari
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  icons: { 
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png", // Icon jika user save website ke Home Screen iPhone
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className="bg-gray-50 text-gray-900 selection:bg-[#00C9A7] selection:text-white"
        style={{ backgroundColor: "#f9fafb", color: "#111827" }}
      >
        {children}
        
        {/* LETAKKAN FLOATING CART DI SINI (SEBELUM TOASTER) */}
        <FloatingCartPublic />
        <Toaster position="top-center" />
        
      </body>
    </html>
  );
}