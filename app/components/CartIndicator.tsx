"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIndicator() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
      setCartCount(cart.length);
    };

    // Hitung saat pertama dimuat
    updateCartCount();

    // Dengarkan perubahan jika ada kelas yang dimasukkan (Real-time)
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <Link href="/cart" className="relative p-2 text-gray-400 hover:text-[#00C9A7] transition flex items-center justify-center">
      <ShoppingCart size={24} />
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-[#F97316] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
          {cartCount}
        </span>
      )}
    </Link>
  );
}