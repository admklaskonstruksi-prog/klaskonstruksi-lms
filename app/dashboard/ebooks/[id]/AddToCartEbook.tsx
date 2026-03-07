"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AddToCartEbook({ ebook, isUserLoggedIn = true }: { ebook: any, isUserLoggedIn?: boolean }) {
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    const exists = cart.some((item: any) => item.id === ebook.id && item.type === "ebook");
    setIsAdded(exists);
  }, [ebook.id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    const exists = cart.some((item: any) => item.id === ebook.id && item.type === "ebook");
    
    if (exists) {
      toast.error("E-Book sudah ada di keranjang!");
      return;
    }

    const newItem = {
      id: ebook.id,
      title: ebook.title,
      price: Number(ebook.price || 0),
      thumbnail: ebook.cover_url || null, 
      category: "E-Book Eksklusif",
      type: "ebook", 
    };

    cart.push(newItem);
    localStorage.setItem("klas_cart", JSON.stringify(cart));
    
    // Memicu event agar Floating Cart muncul!
    window.dispatchEvent(new Event("cartUpdated"));
    
    setIsAdded(true);
    toast.success("E-Book ditambahkan ke keranjang!");
    // PENGHAPUSAN router.push() AGAR TETAP DI HALAMAN INI
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdded}
      className={`w-full font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
        isAdded 
          ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200" 
          : "bg-[#F97316] hover:bg-[#ea580c] hover:scale-[1.02] text-white shadow-orange-500/20"
      }`}
    >
      {isAdded ? (
        <><Check size={22} /> Sudah di Keranjang</>
      ) : (
        <><ShoppingCart size={22} /> Tambah ke Keranjang</>
      )}
    </button>
  );
}