"use client";

import { enrollUser } from "../actions";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Gunakan hooks client
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import Script from "next/script";
import toast from "react-hot-toast";

// Definisikan tipe window agar tidak error TypeScript
declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Ambil Data Course saat halaman dimuat
  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error || !data) {
        toast.error("Kelas tidak ditemukan");
        router.push("/dashboard");
      } else {
        setCourse(data);
      }
      setIsLoading(false);
    };

    if (id) fetchCourse();
  }, [id, router]);

  // 2. Fungsi Tombol "BAYAR SEKARANG"
  const handlePayment = async () => {
    setIsProcessing(true);

    try {
        // A. Panggil API Internal kita untuk dapat Token Midtrans
        const response = await fetch("/api/midtrans/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                courseId: course.id,
                price: course.price,
                courseTitle: course.title
            })
        });

        const data = await response.json();
        if (!data.token) throw new Error("Gagal mendapatkan token pembayaran");

        // B. Munculkan Popup Midtrans (Snap)
        window.snap.pay(data.token, {
          onSuccess: async function(result: any){
            toast.success("Pembayaran Sukses! Mendaftarkan kelas...");
            
            // PANGGIL SERVER ACTION
            const res = await enrollUser(course.id, course.price);

            if (res?.error) {
                toast.error("Gagal menyimpan data: " + res.error);
                console.error(res.error);
            } else {
                toast.success("Kelas berhasil dibuka!");
                
                // Refresh dan Pindah Halaman
                router.refresh();
                setTimeout(() => {
                    router.push(`/dashboard/learning-path/${course.id}`);
                }, 1000);
            }
        },
        });

    } catch (error) {
        toast.error("Terjadi kesalahan sistem.");
        setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#00C9A7]"/></div>;

  return (
    <>
      {/* Script Wajib Midtrans */}
      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL} 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="max-w-2xl mx-auto py-10 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-[#00C9A7]">
            <ArrowLeft size={18} /> Batal
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h1 className="text-xl font-bold text-gray-800">Checkout Kelas</h1>
            </div>

            <div className="p-8">
                {/* Detail Item */}
                <div className="flex gap-4 mb-8">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden relative">
                         {course.thumbnail_url && <img src={course.thumbnail_url} className="object-cover w-full h-full" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.difficulty} • Akses Selamanya</p>
                    </div>
                </div>

                {/* Rincian Harga */}
                <div className="space-y-3 mb-8 border-t border-gray-100 pt-6">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Harga Kelas</span>
                        <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(course.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Biaya Admin</span>
                        <span className="text-[#00C9A7] font-bold">GRATIS</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-dashed border-gray-200">
                        <span>Total Bayar</span>
                        <span className="text-[#00C9A7]">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(course.price)}</span>
                    </div>
                </div>

                {/* Jaminan */}
                <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 text-sm text-blue-700 mb-8">
                    <ShieldCheck size={20} />
                    <span>Pembayaran dijamin 100% aman oleh Midtrans.</span>
                </div>

                {/* Tombol Bayar */}
                <button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-[#00C9A7] text-white font-bold rounded-xl hover:bg-[#00b894] transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                    {isProcessing ? "Memproses..." : "Bayar Sekarang"}
                </button>
            </div>
        </div>
      </div>
    </>
  );
}