"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AddToCartMini({ item }: { item: any }) {
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    setIsAdded(cart.some((c: any) => c.id === item.id && c.type === "ebook"));
  }, [item.id]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah browser pindah halaman saat tombol diklik
    e.stopPropagation();

    if (isAdded) return;

    const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    cart.push({
      id: item.id,
      title: item.title,
      price: Number(item.price || 0),
      thumbnail: null,
      category: "E-Book Eksklusif",
      type: "ebook"
    });
    localStorage.setItem("klas_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setIsAdded(true);
    toast.success("E-Book ditambahkan ke keranjang!");
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isAdded}
      className={`p-2 rounded-full transition-all ${
        isAdded 
          ? 'bg-green-100 text-green-600 cursor-not-allowed' 
          : 'bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white shadow-sm'
      }`}
      title="Tambah ke Keranjang"
    >
      {isAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
    </button>
  );
}