"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingCartPublic() {
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false); // Penyelamat error Hydration
  const [isPopping, setIsPopping] = useState(false); // Efek animasi saat ditambah
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true); // Beritahu Next.js bahwa komponen sudah aman di render di browser

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
      setCartCount(cart.length);

      // Mainkan efek animasi
      setIsPopping(true);
      setTimeout(() => setIsPopping(false), 300);
    };
    
    // Panggil saat pertama render
    updateCartCount();

    // Dengarkan event perubahan keranjang
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // JANGAN RENDER APAPUN JIKA: Belum mounted, keranjang kosong, dashboard, atau sedang di halaman cart
  if (!isMounted) return null;
  if (cartCount === 0 || pathname === "/cart" || pathname.startsWith("/dashboard")) return null;

  return (
    <Link 
      href="/cart"
      className={`fixed bottom-8 right-6 md:bottom-10 md:right-10 z-[99999] bg-[#F97316] text-white p-4 rounded-full shadow-[0_10px_40px_rgba(249,115,22,0.4)] hover:bg-[#ea580c] transition-all duration-300 flex items-center justify-center group border-2 border-white hover:-translate-y-2 ${
        isPopping ? 'scale-125' : 'scale-100'
      }`}
    >
      <ShoppingCart size={28} className="group-hover:-rotate-12 transition-transform" />
      
      {/* Badge Angka */}
      <span className="absolute -top-2 -right-2 bg-white text-[#F97316] text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-[#F97316]">
        {cartCount}
      </span>
    </Link>
  );
}