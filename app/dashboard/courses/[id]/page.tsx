export const runtime = 'nodejs';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link"; // <-- Import Link
import { ArrowLeft } from "lucide-react"; // <-- Import Icon ArrowLeft
import ChaptersList from "./components/ChaptersList"; 
import EditCourseForm from "./components/EditCourseForm"; 

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseSetupPage(props: Props) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/");

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) return redirect("/dashboard/courses");

  const { data: mainCategories } = await supabase.from("main_categories").select("id, name").order("name");
  const { data: subCategories } = await supabase.from("sub_categories").select("id, name, main_category_id").order("name");
  const { data: courseLevels } = await supabase.from("course_levels").select("id, name").order("name");

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*, lessons(*)") 
    .eq("course_id", id)
    .order("position", { ascending: true });

  chapters?.forEach(ch => {
    if (ch.lessons) ch.lessons.sort((a: any, b: any) => a.position - b.position);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      
      {/* --- TOMBOL BACK BARU DITAMBAHKAN DI SINI --- */}
      <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00C9A7] transition-colors mb-6 font-bold">
        <ArrowLeft size={16} /> Kembali ke Daftar Kelas
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kelas & Modul</h1>
        <p className="text-gray-500">Edit detail spesifik kelas dan susun materi pembelajaran Anda di bawah.</p>
      </div>

      <EditCourseForm 
          course={course} 
          categories={mainCategories || []} 
          subCategories={subCategories || []} 
          levels={courseLevels || []} 
      />

      <hr className="my-8 border-gray-200" />

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