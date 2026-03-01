"use client";

import { useState } from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddToCartButton({ course, isUserLoggedIn }: { course: any, isUserLoggedIn: boolean }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);

    // Ambil keranjang lama dari LocalStorage
    const existingCart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    // Cek apakah kelas sudah ada di keranjang
    if (!existingCart.some((item: any) => item.id === course.id)) {
       existingCart.push({
          id: course.id,
          title: course.title,
          price: course.price,
          thumbnail: course.thumbnail_url,
          category: course.main_categories?.name
       });
       localStorage.setItem("klas_cart", JSON.stringify(existingCart));
    }

    toast.success("Berhasil ditambahkan ke keranjang!");
    
    // Jika belum login, simpan rute checkout di callback, arahkan ke login
    if (!isUserLoggedIn) {
       router.push(`/login?callbackUrl=/cart`);
    } else {
       // Jika sudah login, langsung ke halaman keranjang
       router.push("/cart");
    }
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className="w-full bg-[#F97316] text-white py-4 rounded-xl font-black text-lg hover:bg-[#ea580c] transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
    >
      <ShoppingCart size={20} /> {isAdding ? "Memproses..." : "Beli Sekarang"}
    </button>
  );
}