import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, PlayCircle, Star, Target, Layers } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function PublicCourseDetail(props: { params: Promise<{ id: string }> | { id: string } }) {
  const supabase = await createClient();
  const params = await props.params;
  const id = params.id;

  // 1. QUERY AMAN (Sama seperti sebelumnya)
  const { data: course, error } = await supabase.from("courses").select("*").eq("id", id).single();

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="opacity-30 mb-8" />
        <h2 className="text-3xl font-black text-gray-800 mb-2">Kelas Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Maaf, kelas yang Anda cari mungkin sudah tidak tersedia atau link yang Anda gunakan salah.</p>
        <Link href="/program" className="bg-[#F97316] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20">Kembali ke Katalog</Link>
      </div>
    );
  }

  // 2. Tempel Master Data Kolom Manual
  const { data: subCat } = await supabase.from("sub_categories").select("name").eq("id", course.sub_category_id).single();
  const { data: levelCat } = await supabase.from("course_levels").select("name").eq("id", course.level_id).single();
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#F97316] selection:text-white flex flex-col">
      
      {/* 1. DARK HEADER BANNER (Full Width, Tidak Berisi Card) */}
      <div className="bg-gray-950 text-white pt-12 pb-24 px-4 md:px-8 relative overflow-hidden">
         {/* Dekorasi Background */}
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src="/logo.png" alt="pattern" fill className="object-cover scale-150 grayscale" />
         </div>
         
         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
               <Link href="/program" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00C9A7] transition-colors mb-10 bg-gray-800 px-4 py-2 rounded-lg">
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
               
               <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight text-white">{course.title}</h1>
               <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-3xl leading-relaxed font-medium">{course.description}</p>
               
               <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-base text-gray-300 border-t border-gray-800 pt-8 mt-8">
                  <span className="flex items-center gap-2 font-semibold"><Star size={20} className="text-yellow-400 fill-yellow-400"/> {course.rating || "5.0"} Rating Kelas</span>
                  <span className="flex items-center gap-2 font-semibold"><Layers size={20} className="text-[#00C9A7]"/> {course.course_levels?.name || "All Level"}</span>
                  <span className="flex items-center gap-2 font-semibold"><CheckCircle size={20} className="text-[#00C9A7]"/> {course.sales_count || 0} Siswa Terdaftar</span>
               </div>
            </div>
         </div>
      </div>

      {/* 2. MAIN CONTENT AREA (Dua Kolom) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 w-full pb-24">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative">
            
            {/* KOLOM KIRI: DETAIL MATERI (Scrollable) */}
            <div className="lg:col-span-2 space-y-12 -mt-10 lg:-mt-16 relative z-20">
               
               {/* Yang akan dipelajari */}
               <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-950 mb-8 flex items-center gap-3"><Target className="text-[#F97316]" size={28}/> Tujuan Pembelajaran</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                     {(() => {
                        let keypoints = [];
                        try { 
                          if (typeof course.keypoints === 'string') { keypoints = JSON.parse(course.keypoints); } 
                          else if (Array.isArray(course.keypoints)) { keypoints = course.keypoints; }
                        } catch(e) {}
                        
                        if (keypoints.length === 0) return <p className="text-gray-500 col-span-2">Materi sedang dalam proses update.</p>;

                        return keypoints.map((pt: string, i: number) => (
                           <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition border border-gray-100">
                              <CheckCircle size={22} className="text-[#00C9A7] shrink-0 mt-0.5" strokeWidth={3} />
                              <span className="text-gray-700 text-sm leading-relaxed font-semibold">{pt}</span>
                           </div>
                        ));
                     })()}
                  </div>
               </div>

               {/* Silabus Kelas */}
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

            {/* KOLOM KANAN: KOTAK HARGA (Sticky/Floating) */}
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
                    {course.price > 0 ? (
                      <div className="flex items-end gap-3 flex-wrap">
                        <h2 className="text-4xl font-black text-[#F97316] tracking-tight">Rp {course.price.toLocaleString("id-ID")}</h2>
                        {course.strike_price > 0 && <p className="text-gray-400 line-through text-lg font-bold mb-1">Rp {course.strike_price.toLocaleString("id-ID")}</p>}
                      </div>
                    ) : (
                      <h2 className="text-4xl font-black text-[#00C9A7] tracking-tight">GRATIS</h2>
                    )}
                    <p className="text-xs text-gray-400 font-medium mt-2">Akses selamanya • Sertifikat Penyelesaian • Update Materi</p>
                  </div>

                  <div className="border-t border-gray-100 pt-7 mt-7 space-y-4">
                     {isOwned ? (
                       <Link href={`/dashboard/learning-path/${course.id}`} className="block w-full bg-gray-950 text-white text-center py-4.5 rounded-2xl font-black text-lg hover:bg-gray-800 transition shadow-lg shadow-gray-900/10 flex justify-center items-center gap-2">
                          Masuk Ruang Belajar <ArrowRight size={20} />
                       </Link>
                     ) : (
                       <AddToCartButton course={course} isUserLoggedIn={!!user} />
                     )}
                     <p className="text-center text-xs text-gray-400 px-4">Jaminan 100% uang kembali jika materi tidak sesuai kurikulum.</p>
                  </div>
               </div>
            </div>

         </div>
      </main>
    </div>
  );
}