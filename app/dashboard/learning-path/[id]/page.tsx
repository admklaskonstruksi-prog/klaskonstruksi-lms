import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, PlayCircle, Lock, BookOpen, ArrowRight, Star } from "lucide-react";

// --- CONFIG BUNNY ---
// Library ID dari screenshot terminal Anda (594715)
const BUNNY_LIBRARY_ID = "594715"; 

interface Props {
  // PENTING: Karena nama folder Anda [id], di sini harus id
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ chapterId?: string }>;
}

export default async function LearningPathPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // KITA AMBIL 'id' DARI URL, LALU KITA SIMPAN SEBAGAI 'courseId' BIAR KONSISTEN
  const courseId = params.id; 
  const currentChapterId = searchParams.chapterId;

  const supabase = await createClient();

  // 1. Cek User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 2. Cek Enrollment (Apakah siswa sudah beli?)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId) // Cek pakai ID yang benar
    .single();

  if (!enrollment) {
    // Jika belum beli, lempar ke halaman detail kelas
    return redirect(`/courses/${courseId}`); 
  }

  // 3. Ambil Data Course & Chapters
  const { data: course } = await supabase
    .from("courses")
    .select(`
        *,
        chapters (*)
    `)
    .eq("id", courseId)
    .single();

  if (!course) return <div>Kelas tidak ditemukan</div>;

  // Urutkan chapter berdasarkan posisi
  const chapters = course?.chapters?.sort((a: any, b: any) => a.position - b.position) || [];

  // 4. Tentukan Chapter yang sedang ditonton
  // Jika ada di URL (?chapterId=...), pakai itu. Jika tidak, pakai chapter pertama.
  const activeChapter = currentChapterId 
    ? chapters.find((c: any) => c.id === currentChapterId) 
    : chapters[0];

  // 5. FITUR REKOMENDASI (Cross-Selling)
  const { data: relatedCourses } = await supabase
    .from("courses")
    .select("id, title, price, thumbnail_url, level")
    .eq("category_id", course.category_id) 
    .neq("id", course.id) 
    .eq("is_published", true)
    .limit(3);

  // --- RENDER ---
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden">
      
      {/* KIRI: VIDEO PLAYER AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Mobile */}
        <div className="lg:hidden p-4 bg-white border-b flex items-center gap-2">
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-black">
                ← Kembali
            </Link>
            <span className="font-bold truncate">{course.title}</span>
        </div>

        {/* --- VIDEO PLAYER --- */}
        <div className="bg-black w-full aspect-video relative flex items-center justify-center group">
            {activeChapter?.video_id ? (
                <iframe
                  src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${activeChapter.video_id}?autoplay=false&loop=false&muted=false&preload=true`}
                  loading="lazy"
                  className="w-full h-full border-0 absolute inset-0 z-10"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen={true}
                ></iframe>
            ) : (
                <div className="text-center text-gray-500 flex flex-col items-center">
                    <PlayCircle size={48} className="mb-4 opacity-50" />
                    <p className="mb-1 font-medium text-white">Video belum tersedia</p>
                    <p className="text-xs">Sedang disiapkan oleh instruktur</p>
                </div>
            )}
        </div>

        {/* INFO & REKOMENDASI */}
        <div className="p-6 md:p-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-gray-200 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {activeChapter ? `${activeChapter.position}. ${activeChapter.title}` : "Pilih Materi"}
                    </h1>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                       <BookOpen size={14}/> {course.title}
                    </p>
                </div>
                
                {/* Tombol Selesai */}
                <form>
                    <button className="bg-[#00C9A7] hover:bg-[#00b596] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#00C9A7]/20 transition-all active:scale-95">
                        <CheckCircle size={20} />
                        Tandai Selesai
                    </button>
                </form>
            </div>

            {/* --- FITUR REKOMENDASI (MUNCUL DI BAWAH) --- */}
            {relatedCourses && relatedCourses.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="text-yellow-400 fill-yellow-400" />
                        <h3 className="text-lg font-bold text-gray-900">Rekomendasi Kelas Serupa</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedCourses.map((relCourse: any) => (
                            <Link href={`/courses/${relCourse.id}`} key={relCourse.id} className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="aspect-video relative bg-gray-100">
                                    {relCourse.thumbnail_url && (
                                        <Image src={relCourse.thumbnail_url} alt={relCourse.title} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-[#00C9A7] mb-2">{relCourse.title}</h4>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="font-bold text-gray-900">
                                            {relCourse.price === 0 ? "Gratis" : `Rp ${relCourse.price.toLocaleString()}`}
                                        </span>
                                        <span className="flex items-center gap-1">Detail <ArrowRight size={10}/></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* KANAN: SIDEBAR MATERI (Playlist) */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 h-auto lg:h-full overflow-y-auto flex-shrink-0 shadow-xl z-20">
        <div className="p-5 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
            <h2 className="font-bold text-gray-900 text-lg">Daftar Materi</h2>
            <p className="text-xs text-gray-500 mt-1">{chapters.length} Video Pembelajaran</p>
        </div>

        <div className="divide-y divide-gray-100">
            {chapters.map((chapter: any, index: number) => {
                const isActive = chapter.id === activeChapter?.id;
                return (
                    <Link 
                        key={chapter.id} 
                        href={`/dashboard/learning-path/${courseId}?chapterId=${chapter.id}`}
                        className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${isActive ? 'bg-green-50 border-l-4 border-[#00C9A7]' : 'border-l-4 border-transparent'}`}
                    >
                        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${isActive ? 'bg-[#00C9A7] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium mb-1 ${isActive ? 'text-[#00C9A7]' : 'text-gray-800'}`}>
                                {chapter.title}
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-200">
                                    <PlayCircle size={10} /> {isActive ? 'Sedang Putar' : 'Video'}
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}

            {chapters.length === 0 && (
                <div className="p-10 text-center flex flex-col items-center justify-center h-64 text-gray-400">
                    <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Belum ada materi.</p>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}