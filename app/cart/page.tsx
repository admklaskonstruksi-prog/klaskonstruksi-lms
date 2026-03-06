"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script"; // Import fitur Script Next.js
import { Trash2, ArrowRight, ShieldCheck, ShoppingCart, PlusCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

// Agar TypeScript tidak error membaca object window.snap bawaan Midtrans
declare global {
  interface Window {
    snap: any;
  }
}

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

    // 2. Ambil Rekomendasi dari Database
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
    window.dispatchEvent(new Event("cartUpdated")); // Update counter ikon navbar
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

 // --- FUNGSI INTEGRASI MIDTRANS SUNGGUHAN ---
 const handleCheckout = async () => {
    setIsCheckingOut(true);
    toast.loading("Menyiapkan transaksi aman...");

    try {
      // 1. Dapatkan Data User dari Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.dismiss();
        toast.error("Harap masuk/login terlebih dahulu.");
        router.push("/login?callbackUrl=/cart");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

      // 2. Siapkan Payload untuk API Route Midtrans Anda
      const payload = {
        courseId: cartItems.length === 1 ? cartItems[0].id : "BUNDLE-CART", 
        price: totalPrice,
        title: cartItems.length === 1 ? cartItems[0].title : `Pembelian ${cartItems.length} Kelas KlasKonstruksi`,
        userEmail: user.email,
        userName: profile?.full_name || "Siswa"
      };

      // 3. Tembak API Route Midtrans untuk mendapatkan SNAP TOKEN
      const res = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.dismiss();

      if (!res.ok || !data.token) {
        throw new Error(data.error || "Gagal mendapatkan token dari Midtrans.");
      }

      // 4. Buka Pop-Up Pembayaran Midtrans Snap
      window.snap.pay(data.token, {
        onSuccess: async function (result: any) {
          toast.loading("Pembayaran Berhasil! Memasukkan Anda ke kelas...");

         // 5. Setelah bayar sukses, masukkan user ke tabel enrollments
       
          const enrollmentsData = cartItems.map((item) => ({
            user_id: user.id,
            course_id: item.id
         }));

          const { error: dbError } = await supabase.from("enrollments").insert(enrollmentsData);
          toast.dismiss();

          if (dbError) {
             // MENGELUARKAN PESAN ERROR ASLI KE LAYAR AGAR MUDAH DILACAK
             toast.error(`Gagal mendaftar: ${dbError.message}`);
             console.error("DETAIL ERROR ENROLLMENT:", dbError);
          } else {
             toast.success("Hore! Kelas berhasil ditambahkan.");
             // Kosongkan keranjang
             localStorage.removeItem("klas_cart");
             window.dispatchEvent(new Event("cartUpdated"));
             // Arahkan ke ruang belajar
             router.push("/dashboard/learning-path");
          }
        },
        onPending: function (result: any) {
          toast.success("Menunggu pembayaran Anda...");
          setIsCheckingOut(false);
        },
        onError: function (result: any) {
          toast.error("Pembayaran gagal atau kedaluwarsa!");
          setIsCheckingOut(false);
        },
        onClose: function () {
          toast.error("Anda menutup jendela pembayaran sebelum selesai.");
          setIsCheckingOut(false);
        }
      });

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Sistem sedang sibuk. Coba lagi.");
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0) {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 selection:bg-[#00C9A7] selection:text-white">
           <ShoppingCart size={64} className="text-gray-300 mb-6" />
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h2>
           <p className="text-gray-500 mb-8 text-center max-w-sm">Anda belum menambahkan kelas apa pun. Silakan pilih kelas terbaik untuk meningkatkan karir Anda.</p>
           <Link href="/program" className="bg-[#00C9A7] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#00C9A7]/20 hover:scale-105 transition-transform">Jelajahi Katalog Kelas</Link>
        </div>
     );
  }

  return (
    <>
      {/* SCRIPT MIDTRANS (Wajib dimuat agar pop-up Snap berfungsi) */}
      <Script 
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} 
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 font-sans selection:bg-[#F97316] selection:text-white">
        <div className="max-w-6xl mx-auto">
          <Link href="/program" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00C9A7] transition-colors mb-6 font-bold">
            <ArrowLeft size={16} /> Kembali Belanja
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Selesaikan Pembayaran</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* KIRI: DAFTAR BELANJA */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100">
                   <h3 className="text-lg font-extrabold text-gray-950 mb-6 border-b border-gray-100 pb-4">Item Keranjang ({cartItems.length})</h3>
                   
                   <div className="space-y-6">
                      {cartItems.map(item => (
                         <div key={item.id} className="flex gap-4 items-center group">
                            <div className="w-28 h-16 bg-gray-100 rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                               {item.thumbnail ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/> : null}
                            </div>
                            <div className="flex-1">
                               <p className="text-[10px] text-[#00C9A7] font-black uppercase mb-1">{item.category}</p>
                               <h4 className="font-bold text-gray-800 line-clamp-1 group-hover:text-[#F97316] transition-colors">{item.title}</h4>
                               <p className="text-sm text-gray-950 font-black mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:bg-red-50 hover:text-red-500 p-2.5 rounded-xl transition-all">
                               <Trash2 size={20} />
                            </button>
                         </div>
                      ))}
                   </div>
                </div>

                {/* FITUR REKOMENDASI KELAS */}
                {recommendations.filter(r => !cartItems.find(c => c.id === r.id)).length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-7 rounded-3xl shadow-sm">
                     <h3 className="text-lg font-black text-gray-950 mb-2">Sering Dibeli Bersamaan 🔥</h3>
                     <p className="text-sm text-gray-600 mb-6">Tambahkan kelas ini untuk memperkuat portofolio skill Anda.</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommendations.filter(r => !cartItems.find(c => c.id === r.id)).map(rec => (
                           <div key={rec.id} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-orange-50 hover:border-orange-200 transition-all group">
                              <div className="w-20 h-16 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                                 {rec.thumbnail_url ? <Image src={rec.thumbnail_url} alt="Cover" fill className="object-cover"/> : null}
                              </div>
                              <div className="flex flex-col justify-between flex-1 py-0.5">
                                 <h5 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#F97316] transition">{rec.title}</h5>
                                 <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-black text-gray-900">Rp {rec.price.toLocaleString("id-ID")}</span>
                                    <button onClick={() => {
                                      const newCart = [...cartItems, { id: rec.id, title: rec.title, price: rec.price, thumbnail: rec.thumbnail_url, category: "Rekomendasi" }];
                                      setCartItems(newCart);
                                      localStorage.setItem("klas_cart", JSON.stringify(newCart));
                                      window.dispatchEvent(new Event("cartUpdated"));
                                      toast.success("Ditambahkan ke keranjang!");
                                    }} className="text-[#F97316] hover:bg-orange-100 p-1.5 rounded-full transition-colors">
                                       <PlusCircle size={20} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
             </div>

             {/* KANAN: RINGKASAN PEMBAYARAN */}
             <div className="lg:col-span-1">
                <div className="bg-white p-7 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-28">
                   <h3 className="text-lg font-black text-gray-950 mb-6 border-b border-gray-100 pb-4">Ringkasan Belanja</h3>
                   
                   <div className="space-y-4 text-sm font-medium text-gray-600 border-b border-gray-100 pb-6 mb-6">
                      <div className="flex justify-between items-center">
                         <span>Harga Normal</span>
                         <span className="text-gray-800">Rp {(totalPrice + (cartItems.length * 50000)).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                         <span>Diskon Platform</span>
                         <span className="font-bold">- Rp {(cartItems.length * 50000).toLocaleString("id-ID")}</span>
                      </div>
                   </div>

                   <div className="flex justify-between items-end mb-8">
                      <span className="font-bold text-gray-900">Total Tagihan</span>
                      <span className="text-3xl font-black text-[#F97316] tracking-tight">Rp {totalPrice.toLocaleString("id-ID")}</span>
                   </div>

                   <button 
                     onClick={handleCheckout} 
                     disabled={isCheckingOut}
                     className="w-full bg-[#00C9A7] text-white py-4.5 rounded-2xl font-black text-lg hover:bg-[#00b596] transition-all shadow-lg shadow-[#00C9A7]/30 flex justify-center items-center gap-2 mb-5 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                   >
                     {isCheckingOut ? "Memproses..." : "Bayar Sekarang"} <ArrowRight size={20} />
                   </button>

                   <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 bg-gray-50 py-3 rounded-xl border border-gray-100">
                      <ShieldCheck size={16} className="text-[#00C9A7]" /> 
                      <span className="uppercase tracking-wider">Pembayaran Terenkripsi Aman</span>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </>
  );
}