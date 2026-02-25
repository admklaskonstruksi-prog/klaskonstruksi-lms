import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, BookOpen } from "lucide-react";

// Memaksa Next.js untuk selalu mengambil data terbaru dari database
export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Ambil data enrollment yang aktif untuk user ini
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      course_id,
      courses (
        id,
        title,
        thumbnail_url,
        level
      )
    `)
    .eq("user_id", user.id);

  // Ambil seluruh progres siswa ini
  const { data: allProgress } = await supabase
    .from("user_progress")
    .select("course_id, lesson_id")
    .eq("user_id", user.id);

  // Ambil total materi yang ada di tiap kelas (untuk pembagi persentase)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("course_id, id");

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Kelas <span className="text-[#00C9A7]">Saya</span></h1>
        <p className="text-gray-500 mt-2 font-medium">Lanjutkan progres belajar Anda untuk mencapai target karir.</p>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
           <BookOpen className="mx-auto text-gray-300 mb-4" size={60} />
           <p className="text-gray-500 font-bold text-lg">Anda belum memiliki kelas.</p>
           <Link href="/dashboard" className="text-[#00C9A7] font-black mt-2 inline-block hover:underline">Mulai Cari Kelas Sekarang →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments?.map((item: any) => {
            // HITUNG PERSENTASE OTOMATIS & SISA MATERI
            const courseLessons = allLessons?.filter((l) => l.course_id === item.courses.id) || [];
            const completedLessons = allProgress?.filter((p) => p.course_id === item.courses.id) || [];
            
            const totalLessonsCount = courseLessons.length;
            const completedLessonsCount = completedLessons.length;
            // Hitung sisa materi (pastikan tidak minus)
            const remainingLessonsCount = Math.max(0, totalLessonsCount - completedLessonsCount); 
            
            // Hindari NaN jika kelas belum ada materinya sama sekali
            const progressPercent = totalLessonsCount > 0 
                ? Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100)) 
                : 0;

            return (
            <div key={item.courses.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="relative aspect-video">
                <Image 
                  src={item.courses.thumbnail_url || "https://picsum.photos/400/250"} 
                  alt={item.courses.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Link 
                     href={`/dashboard/learning-path/${item.courses.id}`}
                     className="bg-white text-[#00C9A7] p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                   >
                     <PlayCircle size={32} fill="currentColor" className="text-white" />
                   </Link>
                </div>
              </div>
              
              {/* Tambahkan flex-1 agar isi konten mengisi ruang kosong dengan merata */}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] font-black text-[#00C9A7] bg-teal-50 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block self-start">
                  {item.courses.level || "Beginner"}
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-[#00C9A7] transition-colors line-clamp-2">
                  {item.courses.title}
                </h3>
                
                {/* --- BAR PROGRES DINAMIS DENGAN DETAIL SISA MATERI --- */}
                <div className="space-y-2 mt-auto pt-4">
                  <div className="flex justify-between items-end mb-1">
                    <div>
                       <p className="text-xs font-bold text-gray-400">Progres Belajar</p>
                       <p className="text-[10px] text-gray-500 font-medium mt-1">
                         <span className="text-gray-800 font-bold">{completedLessonsCount}</span> dari {totalLessonsCount} materi ({remainingLessonsCount} belum diputar)
                       </p>
                    </div>
                    <span className="text-xl font-black text-[#00C9A7]">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00C9A7] rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progressPercent}%` }}>
                       {/* Efek kilap kecil pada bar progress */}
                       <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20"></div>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/dashboard/learning-path/${item.courses.id}`}
                  className={`mt-6 w-full py-3 border-2 font-black rounded-xl transition-all text-center block text-sm ${
                    progressPercent >= 100 
                      ? "border-gray-200 text-gray-500 hover:bg-gray-100" 
                      : "border-[#00C9A7] text-[#00C9A7] hover:bg-[#00C9A7] hover:text-white"
                  }`}
                >
                  {progressPercent >= 100 ? "Ulangi Materi" : "Lanjutkan Belajar"}
                </Link>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}