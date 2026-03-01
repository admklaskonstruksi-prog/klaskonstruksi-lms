"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight, ShieldCheck, ShoppingCart, PlusCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const supabase = createClient();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    // 1. Muat Item dari Keranjang
    const items = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    setCartItems(items);

    // 2. Ambil Rekomendasi dari Database secara acak (Misal: 3 kelas terpopuler)
    async function fetchRecommendations() {
      const { data } = await supabase
        .from("courses")
        .select("id, title, price, thumbnail_url")
        .eq("is_published", true)
        .order("sales_count", { ascending: false })
        .limit(3);
      
      if (data) setRecommendations(data);
    }
    fetchRecommendations();
  }, [supabase]);

  const removeItem = (id: string) => {
    const newCart = cartItems.filter(item => item.id !== id);
    setCartItems(newCart);
    localStorage.setItem("klas_cart", JSON.stringify(newCart));
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = async () => {
    // Di sini Anda menyambungkan dengan fungsi Midtrans Checkout Anda
    // ...
    setIsCheckingOut(true);
    toast.success("Memproses pembayaran ke Midtrans...");
    // Simulasi kosongkan keranjang & kembali ke dashboard
    setTimeout(() => {
       localStorage.removeItem("klas_cart");
       router.push("/dashboard/learning-path");
    }, 2000);
  };

  if (cartItems.length === 0) {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
           <ShoppingCart size={64} className="text-gray-300 mb-6" />
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h2>
           <p className="text-gray-500 mb-8">Silakan pilih kelas terbaik untuk Anda pelajari.</p>
           <Link href="/program" className="bg-[#00C9A7] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#00C9A7]/20">Jelajahi Kelas</Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 font-sans selection:bg-[#00C9A7] selection:text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Selesaikan Pembayaran</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* KIRI: DAFTAR BELANJA */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                 <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Item Keranjang ({cartItems.length})</h3>
                 
                 <div className="space-y-6">
                    {cartItems.map(item => (
                       <div key={item.id} className="flex gap-4 items-center">
                          <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                             {item.thumbnail ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover"/> : null}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-gray-800 line-clamp-1">{item.title}</h4>
                             <p className="text-sm text-[#00C9A7] font-black mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-2 transition">
                             <Trash2 size={20} />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>

              {/* FITUR REKOMENDASI KELAS (Cross-Selling) */}
              <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl">
                 <h3 className="text-lg font-bold text-gray-900 mb-2">Sering Dibeli Bersamaan 🔥</h3>
                 <p className="text-sm text-gray-600 mb-6">Tambahkan kelas ini untuk melengkapi skill Anda.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.filter(r => !cartItems.find(c => c.id === r.id)).map(rec => (
                       <div key={rec.id} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-white hover:border-orange-200 transition">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                             {rec.thumbnail_url ? <Image src={rec.thumbnail_url} alt="Cover" fill className="object-cover"/> : null}
                          </div>
                          <div className="flex flex-col justify-between flex-1 py-0.5">
                             <h5 className="text-xs font-bold text-gray-800 line-clamp-2">{rec.title}</h5>
                             <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-black text-gray-900">Rp {rec.price.toLocaleString("id-ID")}</span>
                                <button onClick={() => {
                                  const newCart = [...cartItems, { id: rec.id, title: rec.title, price: rec.price, thumbnail: rec.thumbnail_url }];
                                  setCartItems(newCart);
                                  localStorage.setItem("klas_cart", JSON.stringify(newCart));
                                }} className="text-[#F97316] hover:bg-orange-100 p-1 rounded-full transition">
                                   <PlusCircle size={20} />
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* KANAN: RINGKASAN PEMBAYARAN */}
           <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-[#00C9A7]/5 border border-gray-200 sticky top-28">
                 <h3 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Belanja</h3>
                 
                 <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6 mb-6">
                    <div className="flex justify-between">
                       <span>Harga Normal</span>
                       <span className="font-medium text-gray-800">Rp {(totalPrice + 50000).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-green-500">
                       <span>Diskon Bundle</span>
                       <span className="font-medium">- Rp 50.000</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-end mb-8">
                    <span className="font-bold text-gray-900">Total Tagihan</span>
                    <span className="text-2xl font-black text-[#F97316]">Rp {totalPrice.toLocaleString("id-ID")}</span>
                 </div>

                 <button 
                   onClick={handleCheckout} 
                   disabled={isCheckingOut}
                   className="w-full bg-[#00C9A7] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#00b596] transition shadow-lg shadow-[#00C9A7]/20 flex justify-center items-center gap-2 mb-4"
                 >
                   {isCheckingOut ? "Memproses..." : "Bayar Sekarang"} <ArrowRight size={20} />
                 </button>

                 <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldCheck size={16} /> Pembayaran aman terenkripsi (Midtrans)
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}