import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateCourseForm from "./CreateCourseForm"; // Import komponen baru tadi

export default async function CreateCoursePage() {
  const supabase = await createClient();

  // 1. SECURITY CHECK (Satpam Admin)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return redirect("/dashboard");

  // 2. Ambil Daftar Kategori
  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/dashboard/courses" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 w-fit">
        <ArrowLeft size={18} className="mr-2" /> Kembali ke Daftar Kelas
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buat Kelas Baru</h1>
        <p className="text-gray-500 mt-2">Isi detail dasar kelas untuk mulai mengajar.</p>
      </div>

      {/* Panggil Client Component Form di sini */}
      {/* Kita kirim data kategori sebagai props agar form bisa menampilkannya */}
      <CreateCourseForm categories={categories || []} />
      
    </div>
  );
}