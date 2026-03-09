export const runtime = 'nodejs';

import CreateCourseForm from "./CreateCourseForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CreateCoursePage() {
  const supabase = await createClient();

  // ========================================================
  // SECURITY UI: Cegah Siswa Masuk ke Halaman Ini
  // ========================================================
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");
  // ========================================================

  // Mengambil data dari 3 tabel hierarki kategori
  const { data: mainCategories } = await supabase
    .from("main_categories")
    .select("*")
    .order("name", { ascending: true });

  const { data: subCategories } = await supabase
    .from("sub_categories")
    .select("*")
    .order("name", { ascending: true });

  const { data: levels } = await supabase
    .from("course_levels")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buat Kelas Baru</h1>
        <p className="text-gray-500">Isi detail di bawah ini untuk menambahkan materi Klas Konstruksi baru.</p>
      </div>

      {/* Passing data ke Form */}
      <CreateCourseForm 
        mainCategories={mainCategories || []} 
        subCategories={subCategories || []} 
        levels={levels || []} 
      />
    </div>
  );
}