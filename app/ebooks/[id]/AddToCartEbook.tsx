"use client";
export const runtime = 'edge';

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddToCartEbook({ ebook, isUserLoggedIn }: { ebook: any, isUserLoggedIn: boolean }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Cek apakah e-book sudah ada di keranjang saat halaman dimuat
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    setIsAdded(cart.some((item: any) => item.id === ebook.id && item.type === "ebook"));
  }, [ebook.id]);

  const handleAddToCart = () => {
    if (isAdded) return;
    setIsAdding(true);

    const existingCart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    // Cek duplikasi berdasarkan ID DAN pastikan tipenya ebook
    if (!existingCart.some((item: any) => item.id === ebook.id && item.type === "ebook")) {
       existingCart.push({
          id: ebook.id,
          title: ebook.title,
          price: Number(ebook.price || 0), 
          thumbnail: null, // E-Book tidak memakai thumbnail di cart
          category: "E-Book Eksklusif",
          type: "ebook" // PENANDA INI ADALAH E-BOOK
       });
       localStorage.setItem("klas_cart", JSON.stringify(existingCart));
       window.dispatchEvent(new Event("cartUpdated"));
       setIsAdded(true);
    }

    toast.success("E-Book berhasil ditambahkan ke keranjang!");
    
    // Arahkan ke login jika belum masuk, atau langsung ke cart jika sudah
    if (!isUserLoggedIn) {
       router.push(`/login?callbackUrl=/cart`);
    } else {
       router.push("/cart");
    }
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