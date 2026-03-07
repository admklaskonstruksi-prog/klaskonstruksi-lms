import { Toaster } from "react-hot-toast";
import "./globals.css";
import FloatingCartPublic from "@/app/components/FloatingCartPublic";

export const metadata = {
  title: "KlasKonstruksi",
  description: "Platform Belajar Konstruksi Terlengkap",
  icons: { icon: "/favicon.ico" },
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