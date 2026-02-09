import { createClient } from "@/utils/supabase/server";
import CategoryManager from "./components/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Fetch Kategori
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Kategori</h1>
      
      <CategoryManager categories={categories || []} />
      
    </div>
  );
}