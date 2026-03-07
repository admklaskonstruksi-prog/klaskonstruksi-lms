"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AddToCartMini({ item }: { item: any }) {
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const updateState = () => {
      const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
      setIsAdded(cart.some((c: any) => c.id === item.id));
    };
    updateState();
    window.addEventListener("cartUpdated", updateState);
    return () => window.removeEventListener("cartUpdated", updateState);
  }, [item.id]);

  const toggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");

    if (isAdded) {
      cart = cart.filter((c: any) => c.id !== item.id);
      localStorage.setItem("klas_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Dihapus dari keranjang!");
    } else {
      // Deteksi ini e-book atau kelas berdasarkan keberadaan field pdf_url
      const isEbook = item.pdf_url !== undefined; 
      
      cart.push({
        id: item.id,
        title: item.title,
        price: Number(item.price || 0),
        thumbnail: item.cover_url || item.thumbnail_url || null,
        category: isEbook ? "E-Book Eksklusif" : (item.sub_categories?.name || "Umum"),
        type: isEbook ? "ebook" : "course"
      });
      localStorage.setItem("klas_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Ditambahkan ke keranjang!");
    }
  };

  return (
    <button
      onClick={toggleCart}
      className={`p-2.5 rounded-xl transition-all shadow-sm ${
        isAdded 
          ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
          : 'bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white'
      }`}
      title={isAdded ? "Hapus dari Keranjang" : "Tambah ke Keranjang"}
    >
      {isAdded ? <Trash2 size={20} /> : <ShoppingCart size={20} />}
    </button>
  );
}