import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Pencil, BookOpen, AlertCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
// IMPORT INI PENTING (Sesuaikan path-nya jika perlu)
import { deleteVideoFromBunny } from "./bunnyUtils"; 

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return redirect("/dashboard");

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  // ---------------------------------------------------------
  // SERVER ACTION: HAPUS KELAS + BERSIH-BERSIH VIDEO
  // ---------------------------------------------------------
  async function deleteCourse(formData: FormData) {
    "use server";
    const courseId = formData.get("course_id") as string;
    const supabase = await createClient();
    
    try {
        // 1. AMBIL SEMUA CHAPTER DULU (Cari ID Videonya)
        const { data: chapters } = await supabase
            .from("chapters")
            .select("video_id")
            .eq("course_id", courseId);

        // 2. LOOPING HAPUS VIDEO DI BUNNY.NET
        if (chapters && chapters.length > 0) {
            console.log(`Menghapus ${chapters.length} video dari Bunny...`);
            // Kita pakai Promise.all biar ngebut (hapus barengan)
            await Promise.all(
                chapters.map(async (chapter) => {
                    if (chapter.video_id) {
                        await deleteVideoFromBunny(chapter.video_id);
                    }
                })
            );
        }

        // 3. BARU HAPUS KELASNYA DI DATABASE
        // (Data chapters akan ikut terhapus otomatis karena Cascade SQL tadi)
        const { error } = await supabase.from("courses").delete().eq("id", courseId);
        
        if (error) throw error;

        revalidatePath("/dashboard/courses");
    } catch (e) {
        console.error("Gagal hapus kelas/video:", e);
    }
  }
  // ---------------------------------------------------------

  return (
    // ... (SISA KODE TAMPILAN DI BAWAH SAMA PERSIS SEPERTI SEBELUMNYA)
    <div className="p-6 max-w-7xl mx-auto">
      {/* ... Header, Error State, Empty State sama ... */}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Daftar Kelas</h1>
          <p className="text-gray-500 mt-1">
            Kelola {courses?.length || 0} kelas yang tersedia.
          </p>
        </div>
        <Link
          href="/dashboard/courses/create"
          className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all font-medium shadow-lg shadow-gray-200"
        >
          <Plus size={18} /> Buat Kelas Baru
        </Link>
      </div>

       {/* ERROR STATE */}
       {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6 border border-red-100 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Gagal memuat data kelas: {error.message}</span>
        </div>
      )}

      {/* EMPTY STATE */}
      {!courses?.length && !error && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada kelas</h3>
          <p className="text-gray-500 mb-6">Mulai dengan membuat kelas pertama Anda.</p>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <div key={course.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            
            {/* THUMBNAIL */}
            <div className="aspect-video relative bg-gray-100 border-b border-gray-100">
               {course.thumbnail_url ? (
                  <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <span className="text-xs font-medium">No Image</span>
                  </div>
               )}
               <div className="absolute top-3 left-3">
                 <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm ${course.is_published ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                    {course.is_published ? "Tayang" : "Draft"}
                 </span>
               </div>
            </div>

            {/* KONTEN */}
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-auto">
                <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {course.description || "Tidak ada deskripsi singkat."}
                </p>
              </div>
              
              {/* TOMBOL AKSI */}
              <div className="flex items-center gap-3 pt-5 mt-4 border-t border-gray-100">
                <a href={`/dashboard/courses/${course.id}`} className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg text-center hover:bg-black transition-colors flex items-center justify-center gap-2">
                  <Pencil size={14} /> Kelola Materi
                </a>

                {/* FORM HAPUS */}
                <form action={deleteCourse}>
                    <input type="hidden" name="course_id" value={course.id} />
                    <button type="submit" className="bg-red-50 text-red-600 p-2.5 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100" title="Hapus Kelas & Video">
                        <Trash2 size={18} />
                    </button>
                </form>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}