import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, PlayCircle, Star } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function PublicCourseDetail(props: { params: Promise<{ id: string }> | { id: string } }) {
  const supabase = await createClient();
  
  // Pastikan parameter di-resolve (kompatibel dengan Next.js 14 & 15)
  const params = await props.params;
  const id = params.id;

  // 1. QUERY AMAN: Ambil data kelas (Flat)
  const { data: course, error } = await supabase.from("courses").select("*").eq("id", id).single();

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Kelas tidak ditemukan.</h2>
        <p className="text-gray-500 mb-6">URL mungkin salah atau kelas sudah tidak tersedia.</p>
        <Link href="/program" className="bg-[#00C9A7] text-white px-6 py-3 rounded-lg font-bold">Kembali ke Katalog</Link>
      </div>
    );
  }

  // 2. Tempelkan nama kategori secara manual agar UI tetap cantik
  const { data: subCat } = await supabase.from("sub_categories").select("name").eq("id", course.sub_category_id).single();
  const { data: levelCat } = await supabase.from("course_levels").select("name").eq("id", course.level_id).single();
  course.sub_categories = subCat || null;
  course.course_levels = levelCat || null;

  // 3. Ambil Silabus dengan Error Handling
  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select(`id, title, position, lessons(id, title, description, position, is_preview)`)
    .eq("course_id", id)
    .eq("is_published", true)
    .order("position", { ascending: true });

  if (chaptersError) console.error("Gagal memuat silabus:", chaptersError.message);

  // 4. Cek Kepemilikan (Jika Login)
  const { data: { user } } = await supabase.auth.getUser();
  let isOwned = false;
  if (user) {
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", id).single();
    if (enrollment) isOwned = true;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 selection:bg-[#00C9A7] selection:text-white">
      {/* HEADER DETAIL */}
      <div className="bg-gray-900 text-white pt-10 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/program" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft size={16} /> Kembali ke Katalog
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#00C9A7]/20 text-[#00C9A7] px-3 py-1 rounded-full text-xs font-bold border border-[#00C9A7]/30">
                  {course.sub_categories?.name || "Umum"}
                </span>
                <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30">
                  {course.course_levels?.name || course.difficulty || "Semua Level"}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{course.title}</h1>
              <p className="text-gray-400 text-lg mb-6 line-clamp-3">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-300">
                 <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400"/> {course.rating || "5.0"} Rating</span>
                 <span className="flex items-center gap-1"><CheckCircle size={16} className="text-[#00C9A7]"/> {course.sales_count || 0} Terdaftar</span>
              </div>
            </div>

            {/* KOTAK HARGA */}
            <div className="bg-white text-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 lg:translate-y-20 z-10 relative">
               <div className="aspect-video bg-gray-100 rounded-xl mb-6 relative overflow-hidden">
                 {course.thumbnail_url ? (
                   <Image src={course.thumbnail_url} alt="Cover" fill className="object-cover" />
                 ) : (
                   <div className="flex items-center justify-center h-full text-gray-400"><PlayCircle size={48} /></div>
                 )}
               </div>
               
               <div className="mb-6">
                 {course.price > 0 ? (
                   <>
                     <h2 className="text-3xl font-black text-[#00C9A7]">Rp {course.price.toLocaleString("id-ID")}</h2>
                     {course.strike_price > 0 && <p className="text-gray-400 line-through text-sm mt-1">Rp {course.strike_price.toLocaleString("id-ID")}</p>}
                   </>
                 ) : (
                   <h2 className="text-3xl font-black text-[#00C9A7]">GRATIS</h2>
                 )}
               </div>

               {isOwned ? (
                 <Link href={`/dashboard/learning-path/${course.id}`} className="block w-full bg-gray-900 text-white text-center py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
                   Lanjut Belajar
                 </Link>
               ) : (
                 <AddToCartButton course={course} isUserLoggedIn={!!user} />
               )}
            </div>
          </div>
        </div>
      </div>

      {/* KONTEN SILABUS */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 lg:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-12">
            
            {/* Yang akan dipelajari */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Yang Akan Anda Pelajari</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(() => {
                     let keypoints = [];
                     try { 
                       if (typeof course.keypoints === 'string') { keypoints = JSON.parse(course.keypoints); } 
                       else if (Array.isArray(course.keypoints)) { keypoints = course.keypoints; }
                     } catch(e) {}
                     
                     if (keypoints.length === 0) return <p className="text-gray-500">Materi akan segera diupdate.</p>;

                     return keypoints.map((pt: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                           <CheckCircle size={20} className="text-[#00C9A7] shrink-0 mt-0.5" />
                           <span className="text-gray-600 text-sm leading-relaxed">{pt}</span>
                        </div>
                     ));
                  })()}
               </div>
            </div>

            {/* Silabus Kelas */}
            <div>
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Silabus Kurikulum</h2>
               <div className="space-y-4">
                  {(!chapters || chapters.length === 0) && <p className="text-gray-500">Silabus belum tersedia.</p>}
                  {chapters?.map((chapter: any, idx: number) => (
                     <div key={chapter.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="p-5 bg-gray-50 font-bold text-gray-800 flex justify-between items-center border-b border-gray-100">
                           <span>Bab {idx + 1}: {chapter.title}</span>
                           <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{chapter.lessons?.length || 0} Materi</span>
                        </div>
                        <div className="p-2">
                           {chapter.lessons?.sort((a:any, b:any) => a.position - b.position).map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition">
                                 <PlayCircle size={18} className={lesson.is_preview ? "text-[#00C9A7]" : "text-gray-300"} />
                                 <p className={`text-sm ${lesson.is_preview ? "font-bold text-gray-800" : "text-gray-600"}`}>{lesson.title}</p>
                                 {lesson.is_preview && <span className="ml-auto text-[10px] bg-teal-50 text-[#00C9A7] font-bold px-2 py-1 rounded">PREVIEW GRATIS</span>}
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}