import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StudentMarketplace from "@/app/dashboard/components/StudentMarketplace";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const supabase = await createClient();

  // 1. Cek User Session (Apakah pengunjung sudah login atau belum)
  const { data: { user } } = await supabase.auth.getUser();
  let ownedCourseIds: string[] = [];
  
  // Jika sudah login, cek kelas apa saja yang sudah dia beli
  if (user) {
    const { data: myEnrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", user.id);
    ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];
  }

  // 2. Ambil List Kategori & Sub Kategori
  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");
  const { data: subCategories } = await supabase.from("sub_categories").select("id, name, main_category_id").order("name");

  // 3. Ambil SEMUA Kelas yang di-publish
  const { data: courses } = await supabase
    .from("courses")
    .select(`*, main_categories!main_category_id(id, name), sub_categories!sub_category_id(id, name), course_levels!level_id(id, name)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 selection:bg-[#00C9A7] selection:text-white">
      
      {/* HEADER HALAMAN */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-16 px-6 relative overflow-hidden">
        {/* Dekorasi Background Opsional */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9A7]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#00C9A7] transition-colors mb-6 bg-gray-50 hover:bg-[#00C9A7]/10 px-4 py-2 rounded-lg">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Katalog <span className="text-[#00C9A7]">Program Klas</span>
          </h1>
          <p className="text-gray-500 max-w-2xl text-base md:text-lg">
            Jelajahi puluhan materi siap kerja dari praktisi ahli. Tingkatkan skill Anda di bidang manajemen proyek, estimasi biaya, BIM, hingga struktur.
          </p>
        </div>
      </div>

      {/* KONTEN KATALOG (Menggunakan Komponen Filter yang sama dengan Dashboard) */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-8 relative z-20">
        <StudentMarketplace 
          courses={courses || []} 
          mainCategories={categories || []} 
          subCategories={subCategories || []} 
          ownedCourseIds={ownedCourseIds}
        />
      </div>

    </div>
  );
}