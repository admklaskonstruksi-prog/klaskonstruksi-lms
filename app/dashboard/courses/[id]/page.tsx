import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChaptersList from "./components/ChaptersList"; 
import EditCourseForm from "./components/EditCourseForm"; 

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseSetupPage(props: Props) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createClient();

  // 1. Cek User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/");

  // 2. Ambil Data Kelas (Single)
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) return redirect("/dashboard/courses");

  // --- TARIK DATA UNTUK SEMUA DROPDOWN ---
  const { data: mainCategories } = await supabase.from("main_categories").select("id, name").order("name");
  const { data: subCategories } = await supabase.from("sub_categories").select("id, name, main_category_id").order("name");
  const { data: courseLevels } = await supabase.from("course_levels").select("id, name").order("name");

  // 3. Ambil Data Modul (Chapter) DAN Materi (Lessons) di dalamnya
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*, lessons(*)") // Menarik data tabel berelasi
    .eq("course_id", id)
    .order("position", { ascending: true });

  // Urutkan lessons berdasarkan posisi agar rapi
  chapters?.forEach(ch => {
    if (ch.lessons) ch.lessons.sort((a: any, b: any) => a.position - b.position);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kelas & Modul</h1>
        <p className="text-gray-500">Edit detail spesifik kelas dan susun materi pembelajaran Anda di bawah.</p>
      </div>

      {/* --- BAGIAN 1: FORM EDIT DETAIL KELAS --- */}
      {/* Kirim semua data referensi ke komponen form */}
      <EditCourseForm 
          course={course} 
          categories={mainCategories || []} 
          subCategories={subCategories || []} 
          levels={courseLevels || []} 
      />

      <hr className="my-8 border-gray-200" />

      {/* --- BAGIAN 2: KELOLA MATERI (MODUL & VIDEO) --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
           <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">2</span>
           Kurikulum & Materi
        </h2>
        <p className="text-gray-500 text-sm mb-4 pl-10">
          Buat <b>Bab/Bagian</b> (misal: Pengantar), lalu tambahkan <b>Video Materi</b> di dalamnya.
        </p>
        
        <div className="pl-0 md:pl-10">
            <ChaptersList 
                initialData={chapters || []} 
                courseId={id} 
            />
        </div>
      </div>

    </div>
  );
}