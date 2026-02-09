import { Toaster } from "react-hot-toast"; // <--- INI YANG KURANG TADI
import "./globals.css";

export const metadata = {
  title: "KlasKonstruksi",
  description: "Platform Belajar Konstruksi Terlengkap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 selection:bg-[#00C9A7] selection:text-white">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}