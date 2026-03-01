import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, PlayCircle, Star, Target, Layers, Zap, ArrowRight } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function PublicCourseDetail({ params }: any) {
  const supabase = await createClient();
  
  // Mengamankan pembacaan parameter URL
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) return <div className="p-20 text-center font-bold">Membaca ID Kelas...</div>;

  // 1. QUERY AMAN
  const { data: course, error } = await supabase.from("courses").select("*").eq("id", id).single();

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="opacity-30 mb-8" />
        <h2 className="text-3xl font-black text-gray-800 mb-2">Kelas Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Maaf, kelas yang Anda cari mungkin sudah tidak tersedia atau belum di-publish.</p>
        <Link href="/program" className="bg-[#F97316] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition hover:-translate-y-1">Kembali ke Katalog</Link>
      </div>
    );
  }

  // 2. Tempel Master Data Kolom Manual
  let subCat = null;
  let levelCat = null;
  if (course.sub_category_id) {
    const { data } = await supabase.from("sub_categories").select("name").eq("id", course.sub_category_id).single();
    subCat = data;
  }
  if (course.level_id) {
    const { data } = await supabase.from("course_levels").select("name").eq("id", course.level_id).single();
    levelCat = data;
  }
  course.sub_categories = subCat || null;
  course.course_levels = levelCat || null;

  // 3. Ambil Silabus
  const { data: chapters } = await supabase
    .from("chapters")
    .select(`id, title, position, lessons(id, title, description, position, is_preview)`)
    .eq("course_id", id)
    .eq("is_published", true)
    .order("position", { ascending: true });

  // 4. Cek Kepemilikan (Jika Login)
  const { data: { user } } = await supabase.auth.getUser();
  let isOwned = false;
  if (user) {
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", id).single();
    if (enrollment) isOwned = true;
  }

  // FORMAT HARGA AMAN
  const safePrice = Number(course.price || 0);
  const safeStrikePrice = Number(course.strike_price || 0);
  const safeRating = Number(course.rating || 5);

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#F97316] selection:text-white flex flex-col">
      {/* HEADER BANNER */}
      <div className="bg-gray-950 text-white pt-12 pb-24 px-4 md:px-8 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src="/logo.png" alt="pattern" fill className="object-cover scale-150 grayscale" />
         </div>
         
         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
               <Link href="/program" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00C9A7] transition-colors mb-10 bg-gray-800 px-4 py-2 rounded-lg w-max">
                 <ArrowLeft size={16} /> Kembali ke Katalog Program
               </Link>
               
               <div className="flex items-center gap-3 mb-5">
                 <span className="bg-[#00C9A7]/20 text-[#00C9A7] px-4 py-1.5 rounded-full text-xs font-bold border border-[#00C9A7]/30 tracking-wide uppercase">
                   {course.sub_categories?.name || "Kategori Umum"}
                 </span>
                 <span className="bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-500/30">
                   {course.course_levels?.name || course.difficulty || "Semua Level"}
                 </span>
               </div>
               
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight text-white">{course.title}</h1>
               <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-3xl leading-relaxed font-medium">{course.description}</p>
               
               <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-base text-gray-300 border-t border-gray-800 pt-8 mt-8">
                  <span className="flex items-center gap-2 font-semibold"><Star size={20} className="text-yellow-400 fill-yellow-400"/> {safeRating.toFixed(1)} Rating Kelas</span>
                  <span className="flex items-center gap-2 font-semibold"><Layers size={20} className="text-[#00C9A7]"/> {course.course_levels?.name || "All Level"}</span>
                  <span className="flex items-center gap-2 font-semibold"><CheckCircle size={20} className="text-[#00C9A7]"/> {course.sales_count || 0} Siswa Terdaftar</span>
               </div>
            </div>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 w-full pb-24">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative">
            
            {/* KOLOM KIRI: KONTEN MATERI */}
            <div className="lg:col-span-2 space-y-12 -mt-10 lg:-mt-16 relative z-20">
               
               {/* --- GOALS & KEYPOINTS SECTION --- */}
               <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 space-y-10">
                  
                  {/* YOUR GOAL (Tujuan Utama) */}
                  {course.goals && (
                     <div>
                        <h2 className="text-2xl font-black text-gray-950 mb-5 flex items-center gap-3">
                           <Target className="text-[#F97316]" size={28}/> Your Goal
                        </h2>
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl text-gray-800 font-semibold leading-relaxed shadow-sm">
                           <p>{course.goals}</p>
                        </div>
                     </div>
                  )}

                  {/* KEY POINTS (Poin Kunci) */}
                  <div>
                     <h2 className="text-2xl font-black text-gray-950 mb-6 flex items-center gap-3">
                        <Zap className="text-[#00C9A7]" size={28}/> Key Points
                     </h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {(() => {
                           let keypoints = [];
                           try { 
                             if (typeof course.keypoints === 'string') { keypoints = JSON.parse(course.keypoints); } 
                             else if (Array.isArray(course.keypoints)) { keypoints = course.keypoints; }
                           } catch(e) {}
                           
                           if (!keypoints || keypoints.length === 0) return <p className="text-gray-500 col-span-2 italic">Key points sedang dalam proses update.</p>;

                           return keypoints.map((pt: string, i: number) => (
                              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#00C9A7]/30 hover:bg-[#00C9A7]/5 transition-colors group">
                                 <CheckCircle size={22} className="text-[#00C9A7] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                                 <span className="text-gray-700 text-sm font-semibold leading-relaxed">{pt}</span>
                              </div>
                           ));
                        })()}
                     </div>
                  </div>
               </div>

               {/* --- SILABUS SECTION --- */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between gap-4">
                     <h2 className="text-2xl md:text-3xl font-black text-gray-950">Kurikulum & Silabus</h2>
                     <span className="text-sm font-bold text-[#F97316] bg-orange-100 px-4 py-2 rounded-full">{chapters?.length || 0} Bab</span>
                  </div>
                  
                  <div className="space-y-5">
                     {(!chapters || chapters.length === 0) && <p className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">Silabus belum tersedia.</p>}
                     {chapters?.map((chapter: any, idx: number) => (
                        <div key={chapter.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden hover:border-[#F97316]/20 transition-all">
                           <div className="p-6 bg-gray-50 font-extrabold text-gray-950 flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 gap-2">
                              <span className="text-lg">Bab {idx + 1}: {chapter.title}</span>
                              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100 w-max">{chapter.lessons?.length || 0} Materi Pembelajaran</span>
                           </div>
                           <div className="p-3 space-y-1">
                              {chapter.lessons?.sort((a:any, b:any) => a.position - b.position).map((lesson: any, lIdx: number) => (
                                 <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${lesson.is_preview ? 'bg-[#00C9A7]/10 text-[#00C9A7]' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                       <PlayCircle size={20} />
                                    </div>
                                    <p className={`text-sm flex-1 ${lesson.is_preview ? "font-bold text-gray-900" : "text-gray-700 font-medium"}`}>{lIdx + 1}. {lesson.title}</p>
                                    {lesson.is_preview && <span className="ml-auto text-[10px] bg-teal-50 text-[#00C9A7] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-inner shadow-teal-100">Preview</span>}
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* KOLOM KANAN: KOTAK HARGA STICKY */}
            <div className="lg:col-span-1 lg:sticky lg:top-28 lg:self-start -mt-20 lg:-mt-64 relative z-30">
               <div className="bg-white text-gray-950 rounded-3xl p-7 shadow-2xl shadow-gray-200/70 border border-gray-100">
                  <div className="aspect-video bg-gray-100 rounded-2xl mb-7 relative overflow-hidden border border-gray-100 group shadow-inner">
                    {course.thumbnail_url ? (
                      <Image src={course.thumbnail_url} alt="Cover" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 gap-2">
                         <Image src="/logo.png" alt="logo" width={50} height={50} className="grayscale opacity-20" />
                         <PlayCircle size={40} className="opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <PlayCircle size={60} className="text-white opacity-80" />
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    {safePrice > 0 ? (
                      <div className="flex items-end gap-3 flex-wrap">
                        <h2 className="text-4xl font-black text-[#F97316] tracking-tight">Rp {safePrice.toLocaleString("id-ID")}</h2>
                        {safeStrikePrice > 0 && <p className="text-gray-400 line-through text-lg font-bold mb-1">Rp {safeStrikePrice.toLocaleString("id-ID")}</p>}
                      </div>
                    ) : (
                      <h2 className="text-4xl font-black text-[#00C9A7] tracking-tight">GRATIS</h2>
                    )}
                    <p className="text-xs text-gray-400 font-medium mt-2">Akses selamanya • Sertifikat • Update Materi</p>
                  </div>

                  <div className="border-t border-gray-100 pt-7 mt-7 space-y-4">
                     {isOwned ? (
                       <Link href={`/dashboard/learning-path/${course.id}`} className="block w-full bg-gray-950 text-white text-center py-4.5 rounded-2xl font-black text-lg hover:bg-gray-800 transition shadow-lg shadow-gray-900/10 flex justify-center items-center gap-2">
                          Masuk Ruang Belajar <ArrowRight size={20} />
                       </Link>
                     ) : (
                       <AddToCartButton course={course} isUserLoggedIn={!!user} />
                     )}
                     <p className="text-center text-xs text-gray-400 px-4">Jaminan 100% materi sesuai kurikulum.</p>
                  </div>
               </div>
            </div>

         </div>
      </main>
    </div>
  );
}