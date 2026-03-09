"use client";
export const runtime = 'nodejs';

import { useState, useEffect } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddToCartButton({ course, isUserLoggedIn }: { course: any, isUserLoggedIn: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const updateState = () => {
      const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
      setIsAdded(cart.some((item: any) => item.id === course.id && (!item.type || item.type === "course")));
    };
    updateState();
    window.addEventListener("cartUpdated", updateState);
    return () => window.removeEventListener("cartUpdated", updateState);
  }, [course.id]);

  const toggleCart = () => {
    setIsAdding(true);
    let cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    if (isAdded) {
       // HAPUS
       cart = cart.filter((item: any) => !(item.id === course.id && (!item.type || item.type === "course")));
       localStorage.setItem("klas_cart", JSON.stringify(cart));
       window.dispatchEvent(new Event("cartUpdated"));
       toast.success("Kelas dihapus dari keranjang!");
    } else {
       // TAMBAH
       cart.push({
          id: course.id,
          title: course.title,
          price: Number(course.price || 0), 
          thumbnail: course.thumbnail_url,
          category: course.sub_categories?.name || "Umum",
          type: "course"
       });
       localStorage.setItem("klas_cart", JSON.stringify(cart));
       window.dispatchEvent(new Event("cartUpdated"));
       toast.success("Kelas berhasil ditambahkan ke keranjang!");
    }
    setIsAdding(false);
  };

  return (
    <button 
      onClick={toggleCart}
      disabled={isAdding}
      className={`w-full py-4.5 rounded-2xl font-black text-lg transition shadow-lg flex items-center justify-center gap-2 ${
        isAdded 
          ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 shadow-none" 
          : "bg-[#F97316] text-white hover:bg-[#ea580c] shadow-orange-500/20 hover:-translate-y-0.5"
      }`}
    >
      {isAdded ? (
        <><Trash2 size={20} /> Hapus dari Keranjang</>
      ) : (
        <><ShoppingCart size={20} /> {isAdding ? "Memproses..." : "Beli Sekarang"}</>
      )}
    </button>
  );
}