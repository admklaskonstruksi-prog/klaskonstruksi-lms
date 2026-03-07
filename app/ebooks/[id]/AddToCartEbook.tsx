"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddToCartEbook({ ebook, isUserLoggedIn = true }: { ebook: any, isUserLoggedIn?: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Cek keranjang & update otomatis jika ada perubahan di halaman lain
  useEffect(() => {
    const updateState = () => {
      const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
      setIsAdded(cart.some((item: any) => item.id === ebook.id && item.type === "ebook"));
    };
    updateState(); // Cek saat pertama render
    window.addEventListener("cartUpdated", updateState);
    return () => window.removeEventListener("cartUpdated", updateState);
  }, [ebook.id]);

  const toggleCart = () => {
    setIsAdding(true);
    let cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    if (isAdded) {
      // HAPUS DARI KERANJANG
      cart = cart.filter((item: any) => !(item.id === ebook.id && item.type === "ebook"));
      localStorage.setItem("klas_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("E-Book dihapus dari keranjang!");
    } else {
      // TAMBAH KE KERANJANG
      cart.push({
        id: ebook.id,
        title: ebook.title,
        price: Number(ebook.price || 0),
        thumbnail: ebook.cover_url || null, 
        category: "E-Book Eksklusif",
        type: "ebook", 
      });
      localStorage.setItem("klas_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("E-Book ditambahkan ke keranjang!");
    }
    
    setIsAdding(false);
  };

  return (
    <button 
      onClick={toggleCart}
      disabled={isAdding}
      className={`w-full font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
        isAdded 
          ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 shadow-none" 
          : "bg-[#F97316] text-white hover:bg-[#ea580c] hover:-translate-y-0.5 shadow-orange-500/20"
      }`}
    >
      {isAdded ? (
        <><Trash2 size={22} /> Hapus dari Keranjang</>
      ) : (
        <><ShoppingCart size={22} /> {isAdding ? "Memproses..." : "Tambah ke Keranjang"}</>
      )}
    </button>
  );
}