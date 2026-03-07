import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Star, Target, CheckCircle2, ShoppingCart, BookOpen } from "lucide-react";
import Link from "next/link";

export const runtime = 'edge';

export default async function EbookDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // 1. Ambil data E-book berdasarkan ID dari URL
  const { data: ebook } = await supabase
    .from("ebooks")
    .select("*")
    .eq("id", params.id)
    .single();

  // Jika E-book tidak ditemukan, tampilkan 404
  if (!ebook) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-gray-900 text-white pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-800 text-green-400 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
              <BookOpen size={16} /> E-Book Eksklusif
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {ebook.title}
            </h1>
            
            {/* Social Proof Section */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-orange-400">
                <Star size={18} className="fill-current" />
                <span className="font-bold">{ebook.rating}</span>
                <span className="text-gray-400">({ebook.reviews_count} review)</span>
              </div>
              <div className="text-gray-400">
                <span className="font-bold text-white">{ebook.sold_count}</span> Terjual
              </div>
            </div>
          </div>

          {/* Harga & Action Card (Desktop) */}
          <div className="bg-white text-gray-900 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Harga E-Book</h3>
            <div className="text-4xl font-black text-green-600 mb-6">
              {ebook.price === 0 ? "GRATIS" : `Rp ${ebook.price.toLocaleString("id-ID")}`}
            </div>
            
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3">
              <ShoppingCart size={20} />
              Tambah ke Keranjang
            </button>
            <p className="text-center text-xs text-gray-500">
              Akses file PDF selamanya setelah pembelian.
            </p>
          </div>
        </div>
      </div>

      {/* KONTEN DETAIL SECTION */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          
          {/* Your Goals */}
          {ebook.goals && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="text-orange-500" />
                Apa yang akan Anda capai?
              </h2>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-700 leading-relaxed">
                  {ebook.goals}
                </p>
              </div>
            </section>
          )}

          {/* Keypoints */}
          {ebook.keypoints && ebook.keypoints.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Poin Utama E-Book Ini
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {ebook.keypoints.map((point: string, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}