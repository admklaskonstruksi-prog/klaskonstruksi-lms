"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AddToCartButton({ course, isUserLoggedIn }: { course: any, isUserLoggedIn: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    setIsAdded(cart.some((item: any) => item.id === course.id && (!item.type || item.type === "course")));
  }, [course.id]);

  const handleAddToCart = () => {
    if (isAdded) return;
    setIsAdding(true);

    const existingCart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    if (!existingCart.some((item: any) => item.id === course.id && (!item.type || item.type === "course"))) {
       existingCart.push({
          id: course.id,
          title: course.title,
          price: Number(course.price || 0), 
          thumbnail: course.thumbnail_url,
          category: course.sub_categories?.name || "Umum",
          type: "course"
       });
       localStorage.setItem("klas_cart", JSON.stringify(existingCart));
       window.dispatchEvent(new Event("cartUpdated")); // Memicu Floating Cart
       setIsAdded(true);
    }

    toast.success("Kelas berhasil ditambahkan ke keranjang!");
    setIsAdding(false);
    // PENGHAPUSAN router.push() AGAR TETAP DI HALAMAN INI
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding || isAdded}
      className={`w-full py-4.5 rounded-2xl font-black text-lg transition shadow-lg flex items-center justify-center gap-2 ${
        isAdded 
          ? "bg-green-100 text-green-700 cursor-not-allowed shadow-none border border-green-200" 
          : "bg-[#F97316] text-white hover:bg-[#ea580c] shadow-orange-500/20 hover:-translate-y-0.5"
      }`}
    >
      {isAdded ? (
        <><Check size={20} /> Sudah di Keranjang</>
      ) : (
        <><ShoppingCart size={20} /> {isAdding ? "Memproses..." : "Beli Sekarang"}</>
      )}
    </button>
  );
}