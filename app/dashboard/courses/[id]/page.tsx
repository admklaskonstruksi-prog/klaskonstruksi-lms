import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChaptersList from "./components/ChaptersList"; 
import EditCourseForm from "./components/EditCourseForm"; // <--- Import Komponen Baru

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

  // 3. Ambil Data Modul
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("course_id", id)
    .order("position", { ascending: true });

  // 4. Ambil Kategori (Buat Dropdown di Form Edit)
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kelas</h1>
        <p className="text-gray-500">Edit detail kelas dan atur materi pembelajaran di sini.</p>
      </div>

      {/* --- BAGIAN 1: FORM EDIT DETAIL KELAS --- */}
      <EditCourseForm 
        course={course} 
        categories={categories || []} 
      />

      <hr className="my-8 border-gray-200" />

      {/* --- BAGIAN 2: KELOLA MATERI (MODUL & VIDEO) --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
           <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">2</span>
           Kurikulum & Materi
        </h2>
        <p className="text-gray-500 text-sm mb-4 pl-10">Susun bab dan upload video materi di sini.</p>
        
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