import CategoryManager from "./components/CategoryManager";
import { createClient } from "@/utils/supabase/server";

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Ambil data dari 3 tabel yang baru kita buat
  const { data: mainCategories } = await supabase
    .from("main_categories")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: subCategories } = await supabase
    .from("sub_categories")
    .select("*, main_categories(name)") // Mengambil nama main kategori untuk ditampilkan di tabel
    .order("created_at", { ascending: false });

  const { data: levels } = await supabase
    .from("course_levels")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori & Level</h1>
        <p className="text-gray-500">Kelola hierarki kategori untuk kelas Konstruksi Anda.</p>
      </div>

      {/* Passing 3 data baru ke komponen */}
      <CategoryManager 
        mainCategories={mainCategories || []} 
        subCategories={subCategories || []} 
        levels={levels || []} 
      />
    </div>
  );
}