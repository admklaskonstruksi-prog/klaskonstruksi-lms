"use client";
export const runtime = 'edge';

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddToCartButton({ course, isUserLoggedIn }: { course: any, isUserLoggedIn: boolean }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);

    const existingCart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    // Cek duplikasi berdasarkan ID DAN pastikan tipenya course
    if (!existingCart.some((item: any) => item.id === course.id && (!item.type || item.type === "course"))) {
       existingCart.push({
          id: course.id,
          title: course.title,
          price: Number(course.price || 0), 
          thumbnail: course.thumbnail_url,
          category: course.sub_categories?.name || "Umum",
          type: "course" // <--- PENANDA INI ADALAH KELAS
       });
       localStorage.setItem("klas_cart", JSON.stringify(existingCart));
       window.dispatchEvent(new Event("cartUpdated"));
    }

    toast.success("Berhasil ditambahkan ke keranjang!");
    
    if (!isUserLoggedIn) {
       router.push(`/login?callbackUrl=/cart`);
    } else {
       router.push("/cart");
    }
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className="w-full bg-[#F97316] text-white py-4.5 rounded-2xl font-black text-lg hover:bg-[#ea580c] transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
    >
      <ShoppingCart size={20} /> {isAdding ? "Memproses..." : "Beli Sekarang"}
    </button>
  );
}