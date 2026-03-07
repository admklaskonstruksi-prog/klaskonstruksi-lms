"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingCartPublic() {
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
      setCartCount(cart.length);
    };
    
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Sembunyikan jika keranjang kosong atau sedang di halaman cart
  if (cartCount === 0 || pathname === "/cart") return null;

  return (
    <Link 
      href="/cart"
      className="fixed bottom-8 right-6 md:right-10 z-50 bg-[#F97316] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#ea580c] transition-all duration-300 flex items-center justify-center group border border-white/20"
    >
      <ShoppingCart size={28} className="group-hover:-rotate-12 transition-transform" />
      <span className="absolute -top-2 -right-2 bg-white text-[#F97316] text-sm font-black w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-[#F97316]">
        {cartCount}
      </span>
    </Link>
  );
}