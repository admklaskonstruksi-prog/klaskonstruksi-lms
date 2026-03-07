import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, Star, Target, Zap, DownloadCloud, BookOpen } from "lucide-react";
import Link from "next/link";
import AddToCartEbook from "./AddToCartEbook"; 

export const runtime = 'edge';
export const dynamic = "force-dynamic";

export default async function EbookDetailPage({ params }: any) {
  const supabase = await createClient();

  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) return <div className="p-20 text-center font-bold">Membaca ID E-Book...</div>;

  // 1. Ambil data E-Book
  const { data: ebook, error } = await supabase.from("ebooks").select("*").eq("id", id).single();

  if (error || !ebook) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <BookOpen size={64} className="text-gray-300 mb-6" />
        <h2 className="text-3xl font-black text-gray-800 mb-2">E-Book Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Maaf, e-book yang Anda cari mungkin sudah tidak tersedia.</p>
        <Link href="/ebooks" className="bg-[#F97316] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition hover:-translate-y-1">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  // 2. Cek Kepemilikan (Jika Login, cek apakah sudah beli)
  const { data: { user } } = await supabase.auth.getUser();
  let isOwned = false;
  if (user) {
    const { data: purchase } = await supabase
        .from("ebook_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("ebook_id", id)
        .single();
    if (purchase) isOwned = true;
  }

  const safePrice = Number(ebook.price || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#F97316] selection:text-white flex flex-col">
      {/* HEADER BANNER */}
      <div className="bg-gray-950 text-white pt-12 pb-24 px-4 md:px-8 relative overflow-hidden">
         <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900 via-gray-900 to-black"></div>
         
         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
               <Link href="/ebooks" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00C9A7] transition-colors mb-10 bg-gray-800 px-4 py-2 rounded-lg w-max">
                 <ArrowLeft size={16} /> Kembali ke Katalog E-Book
               </Link>
               
               <div className="flex items-center gap-3 mb-5">
                 <span className="bg-[#00C9A7]/20 text-[#00C9A7] px-4 py-1.5 rounded-full text-xs font-bold border border-[#00C9A7]/30 tracking-wide uppercase">
                   E-Book Eksklusif
                 </span>
               </div>
               
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight text-white">{ebook.title}</h1>
               <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-3xl leading-relaxed font-medium">
                 Unduh panduan komprehensif ini untuk mempercepat pembelajaran Anda di industri konstruksi.
               </p>
               
               <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-base text-gray-300 border-t border-gray-800 pt-8 mt-8">
                  <span className="flex items-center gap-2 font-semibold"><Star size={20} className="text-yellow-400 fill-yellow-400"/> {Number(ebook.rating || 5).toFixed(1)} Rating E-Book</span>
                  <span className="flex items-center gap-2 font-semibold"><CheckCircle size={20} className="text-[#00C9A7]"/> {ebook.sold_count || 0} Siswa Membeli</span>
               </div>
            </div>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 w-full pb-24">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative">
            
            {/* KOLOM KIRI: KONTEN DETAIL */}
            <div className="lg:col-span-2 space-y-12 -mt-10 lg:-mt-16 relative z-20">
               
               <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 space-y-10">
                  
                  {/* YOUR GOAL (Tujuan Utama) */}
                  {ebook.goals && (
                     <div>
                        <h2 className="text-2xl font-black text-gray-950 mb-5 flex items-center gap-3">
                           <Target className="text-[#F97316]" size={28}/> Apa yang akan Anda capai?
                        </h2>
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl text-gray-800 font-semibold leading-relaxed shadow-sm">
                           <p className="whitespace-pre-wrap">{ebook.goals}</p>
                        </div>
                     </div>
                  )}

                  {/* KEY POINTS (Poin Kunci) */}
                  {ebook.keypoints && ebook.keypoints.length > 0 && (
                     <div>
                        <h2 className="text-2xl font-black text-gray-950 mb-6 flex items-center gap-3">
                           <Zap className="text-[#00C9A7]" size={28}/> Poin Utama E-Book
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                           {ebook.keypoints.map((pt: string, i: number) => (
                              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#00C9A7]/30 hover:bg-[#00C9A7]/5 transition-colors group">
                                 <CheckCircle size={22} className="text-[#00C9A7] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                                 <span className="text-gray-700 text-sm font-semibold leading-relaxed">{pt}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* KOLOM KANAN: KOTAK HARGA STICKY */}
            <div className="lg:col-span-1 lg:sticky lg:top-28 lg:self-start -mt-20 lg:-mt-64 relative z-30">
               <div className="bg-white text-gray-950 rounded-3xl p-7 shadow-2xl shadow-gray-200/70 border border-gray-100">
                  
                  {/* Cover Dummy Styling */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-teal-900 to-gray-900 rounded-2xl mb-7 relative overflow-hidden border border-gray-100 group shadow-inner flex items-center justify-center p-8 text-center">
                      <div className="absolute top-4 left-4 bg-[#F97316] text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm tracking-wider uppercase">
                         PDF File
                      </div>
                      <h3 className="text-white font-bold text-2xl leading-snug drop-shadow-md">
                        {ebook.title}
                      </h3>
                  </div>
                  
                  <div className="mb-8 border-b border-gray-100 pb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Investasi</p>
                    {safePrice > 0 ? (
                      <h2 className="text-4xl font-black text-[#F97316] tracking-tight">Rp {safePrice.toLocaleString("id-ID")}</h2>
                    ) : (
                      <h2 className="text-4xl font-black text-[#00C9A7] tracking-tight">GRATIS</h2>
                    )}
                    <p className="text-xs text-gray-500 font-medium mt-3">✅ Unduh instan setelah pembayaran</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">✅ Akses selamanya ke file PDF</p>
                  </div>

                  <div className="space-y-4">
                     {/* Jika siswa sudah beli, munculkan tombol Download. Jika belum, tombol Add to Cart */}
                     {isOwned ? (
                        <a 
                          href={ebook.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block w-full bg-gray-950 text-white text-center py-4.5 rounded-2xl font-black text-lg hover:bg-gray-800 transition shadow-lg shadow-gray-900/10 flex justify-center items-center gap-2"
                        >
                           <DownloadCloud size={20} /> Unduh PDF
                        </a>
                     ) : (
                        <AddToCartEbook ebook={ebook} isUserLoggedIn={!!user} />
                     )}
                     <p className="text-center text-[11px] text-gray-400 px-4">Pastikan Anda membaca deskripsi sebelum membeli.</p>
                  </div>
               </div>
            </div>

         </div>
      </main>
    </div>
  );
}