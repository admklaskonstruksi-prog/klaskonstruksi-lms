import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Star, Target, CheckCircle2, BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import AddToCartEbook from "./AddToCartEbook"; // Import tombol keranjang

export const runtime = 'edge';

// 1. UBAH BAGIAN INI: params sekarang adalah Promise
export default async function EbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 2. TAMBAHKAN INI: kita harus 'await' params-nya dulu
  const { id } = await params; 
  
  const supabase = await createClient();

  // 3. Gunakan 'id' yang sudah di-await
  const { data: ebook } = await supabase
    .from("ebooks")
    .select("*")
    .eq("id", id) 
    .single();

  if (!ebook) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER E-BOOK */}
      <div className="bg-gray-900 text-white pt-12 pb-16 px-6">
        <div className="max-w-5xl mx-auto mb-6">
          <Link href="/ebooks" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
             <ChevronLeft size={16} /> Kembali ke Katalog
          </Link>
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-800 text-[#00C9A7] px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-gray-700">
              <BookOpen size={16} /> E-Book Eksklusif
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              {ebook.title}
            </h1>
            
            {/* Social Proof Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-lg">
                <Star size={16} className="fill-current" />
                <span className="font-bold">{ebook.rating}</span>
                <span className="text-orange-200/50">({ebook.reviews_count} review)</span>
              </div>
              <div className="text-gray-300 font-medium">
                <span className="font-bold text-white text-base">{ebook.sold_count}</span> Siswa telah membeli
              </div>
            </div>
          </div>

          {/* Kotak Harga & Tombol Beli */}
          <div className="bg-white text-gray-900 rounded-2xl p-6 md:p-8 shadow-2xl border-b-4 border-[#00C9A7]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Investasi E-Book</h3>
            <div className="text-4xl font-black text-gray-900 mb-6">
              {ebook.price === 0 ? "GRATIS" : `Rp ${ebook.price.toLocaleString("id-ID")}`}
            </div>
            
            {/* Panggil Client Component Keranjang di sini */}
            <AddToCartEbook ebook={ebook} />
            
            <p className="text-center text-xs text-gray-500 mt-4 font-medium flex justify-center items-center gap-2">
              <BookOpen size={14} />Akses file PDF selamanya (Lifetime Access)
            </p>
          </div>
        </div>
      </div>

      {/* KONTEN DETAIL BAWAH */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-10">
          
          {/* Section: Your Goals */}
          {ebook.goals && (
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Target className="text-[#F97316]" size={28} />
                Apa yang akan Anda capai?
              </h2>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {ebook.goals}
                </p>
              </div>
            </section>
          )}

          {/* Section: Keypoints */}
          {ebook.keypoints && ebook.keypoints.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Poin Utama Pembelajaran
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {ebook.keypoints.map((point: string, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-3 shadow-sm hover:border-[#00C9A7]/30 transition-colors">
                    <CheckCircle2 className="text-[#00C9A7] shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 font-medium leading-snug">{point}</span>
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