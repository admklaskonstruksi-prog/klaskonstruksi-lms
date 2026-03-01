import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, PlayCircle, Star, Target, Layers } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

// Memakai tipe "any" agar aman di Next.js 14 maupun 15
export default async function PublicCourseDetail({ params }: any) {
  const supabase = await createClient();
  
  // Membuka parameter URL secara aman
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) return <div className="p-20 text-center font-bold">Membaca ID Kelas...</div>;

  // 1. TARIK DATA UTAMA
  const { data: course, error } = await supabase.from("courses").select("*").eq("id", id).single();

  // JIKA ERROR ATAU KOSONG, TAMPILKAN LAYAR DEBUG INI:
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-red-600 mb-4">Terjadi Kesalahan Pencarian</h2>
        
        {/* --- KOTAK DEBUG (Hanya muncul jika gagal) --- */}
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-sm mb-8 max-w-2xl font-mono text-left w-full shadow-sm">
           <p className="mb-2"><strong className="text-gray-900">ID Kelas Dicari:</strong> <br/>{id}</p>
           <p className="mb-2"><strong className="text-gray-900">Pesan Error Database:</strong> <br/>{error?.message || "Data kosong (Tidak ada error spesifik)."}</p>
           <p className="mb-2"><strong className="text-gray-900">Kode Error:</strong> <br/>{error?.code || "-"}</p>
           <div className="mt-4 pt-4 border-t border-red-200">
             <p className="font-bold text-gray-900">Analisa Sistem:</p>
             <ul className="list-disc pl-5 mt-1 space-y-1">
                {error?.code === "PGRST116" && <li>100% karena sistem keamanan RLS Supabase masih memblokir akses publik. (Jalankan query SQL di langkah sebelumnya).</li>}
                {error?.code === "22P02" && <li>Format ID yang ada di URL salah (bukan format UUID standar).</li>}
                {!error && !course && <li>Kelas memang tidak ada, atau status <b>is_published</b> masih false (belum dipublish di dashboard).</li>}
             </ul>
           </div>
        </div>

        <Link href="/program" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold transition">Kembali ke Katalog</Link>
      </div>
    );
  }

  // 2. AMBIL MASTER DATA KATEGORI
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

  // 3. AMBIL SILABUS
  const { data: chapters } = await supabase
    .from("chapters")
    .select(`id, title, position, lessons(id, title, description, position, is_preview)`)
    .eq("course_id", id)
    .eq("is_published", true)
    .order("position", { ascending: true });

  // 4. CEK USER LOGIN
  const { data: { user } } = await supabase.auth.getUser();
  let isOwned = false;
  if (user) {
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", id).single();
    if (enrollment) isOwned = true;
  }

  const safePrice = Number(course.price || 0);
  const safeStrikePrice = Number(course.strike_price || 0);
  const safeRating = Number(course.rating || 5);

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#00C9A7] selection:text-white flex flex-col">
      {/* HEADER BANNER */}
      <div className="bg-gray-950 text-white pt-12 pb-24 px-4 md:px-8 relative overflow-hidden">
         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
               <Link href="/program" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00C9A7] transition-colors mb-10 bg-gray-800 px-4 py-2 rounded-lg">
                 <ArrowLeft size={16} /> Kembali ke Katalog Program
               </Link>
               <div className="flex items-center gap-3 mb-5">
                 <span className="bg-[#00C9A7]/20 text-[#00C9A7] px-4 py-1.5 rounded-full text-xs font-bold uppercase">{course.sub_categories?.name || "Kategori Umum"}</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">{course.title}</h1>
               <p className="text-gray-300 text-lg mb-10 max-w-3xl leading-relaxed">{course.description}</p>
               <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-sm text-gray-300 border-t border-gray-800 pt-8 mt-8">
                  <span className="flex items-center gap-2 font-semibold"><Star size={18} className="text-yellow-400 fill-yellow-400"/> {safeRating.toFixed(1)} Rating</span>
                  <span className="flex items-center gap-2 font-semibold"><Layers size={18} className="text-[#00C9A7]"/> {course.course_levels?.name || "All Level"}</span>
                  <span className="flex items-center gap-2 font-semibold"><CheckCircle size={18} className="text-[#00C9A7]"/> {course.sales_count || 0} Terdaftar</span>
               </div>
            </div>
         </div>
      </div>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 w-full pb-24">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative">
            <div className="lg:col-span-2 space-y-12 -mt-10 lg:-mt-16 relative z-20">
               
               {/* Tujuan Pembelajaran */}
               <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-950 mb-8 flex items-center gap-3"><Target className="text-[#F97316]" size={28}/> Tujuan Pembelajaran</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                     {(() => {
                        let keypoints = [];
                        try { 
                          if (typeof course.keypoints === 'string') keypoints = JSON.parse(course.keypoints);
                          else if (Array.isArray(course.keypoints)) keypoints = course.keypoints;
                        } catch(e) {}
                        if (keypoints.length === 0) return <p className="text-gray-500 col-span-2">Materi dalam proses update.</p>;
                        return keypoints.map((pt: string, i: number) => (
                           <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <CheckCircle size={22} className="text-[#00C9A7] shrink-0 mt-0.5" strokeWidth={3} />
                              <span className="text-gray-700 text-sm font-semibold">{pt}</span>
                           </div>
                        ));
                     })()}
                  </div>
               </div>

               {/* Silabus */}
               <div className="space-y-8">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-950">Kurikulum & Silabus</h2>
                  <div className="space-y-5">
                     {(!chapters || chapters.length === 0) && <p className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed">Silabus belum tersedia.</p>}
                     {chapters?.map((chapter: any, idx: number) => (
                        <div key={chapter.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                           <div className="p-6 bg-gray-50 font-extrabold text-gray-950 flex justify-between items-center border-b border-gray-100">
                              <span>Bab {idx + 1}: {chapter.title}</span>
                           </div>
                           <div className="p-3 space-y-1">
                              {chapter.lessons?.sort((a:any, b:any) => a.position - b.position).map((lesson: any, lIdx: number) => (
                                 <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition">
                                    <PlayCircle size={20} className={lesson.is_preview ? "text-[#00C9A7]" : "text-gray-300"}/>
                                    <p className="text-sm font-medium">{lIdx + 1}. {lesson.title}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* KOTAK HARGA STICKY */}
            <div className="lg:col-span-1 lg:sticky lg:top-28 lg:self-start -mt-20 lg:-mt-64 relative z-30">
               <div className="bg-white rounded-3xl p-7 shadow-2xl border border-gray-100">
                  <div className="aspect-video bg-gray-100 rounded-2xl mb-7 relative overflow-hidden border border-gray-100">
                    {course.thumbnail_url ? (
                      <Image src={course.thumbnail_url} alt="Cover" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 gap-2">
                         <PlayCircle size={40} className="opacity-40" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-8">
                    {safePrice > 0 ? (
                      <div>
                        <h2 className="text-4xl font-black text-[#F97316]">Rp {safePrice.toLocaleString("id-ID")}</h2>
                        {safeStrikePrice > 0 && <p className="text-gray-400 line-through font-bold">Rp {safeStrikePrice.toLocaleString("id-ID")}</p>}
                      </div>
                    ) : (
                      <h2 className="text-4xl font-black text-[#00C9A7]">GRATIS</h2>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-7 mt-7 space-y-4">
                     {isOwned ? (
                       <Link href={`/dashboard/learning-path/${course.id}`} className="block w-full bg-gray-950 text-white text-center py-4 rounded-2xl font-black text-lg">Mulai Belajar</Link>
                     ) : (
                       <AddToCartButton course={course} isUserLoggedIn={!!user} />
                     )}
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}