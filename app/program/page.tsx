import { createClient } from "@/utils/supabase/server";
import ProgramCatalogClient from "./ProgramCatalogClient";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const supabase = await createClient();

  // 1. Cek User Session (Jika sudah login, ambil data kelas yang sudah dibeli)
  const { data: { user } } = await supabase.auth.getUser();
  let ownedCourseIds: string[] = [];
  
  if (user) {
    const { data: myEnrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", user.id);
    ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];
  }

  // 2. Ambil List Kategori, Sub Kategori, dan Level
  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");
  const { data: subCategories } = await supabase.from("sub_categories").select("id, name, main_category_id").order("name");
  const { data: levels } = await supabase.from("course_levels").select("id, name").order("id");

  // 3. Ambil SEMUA Kelas yang di-publish
  const { data: courses } = await supabase
    .from("courses")
    .select(`*, main_categories!main_category_id(id, name), sub_categories!sub_category_id(id, name), course_levels!level_id(id, name)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <ProgramCatalogClient 
      courses={courses || []} 
      mainCategories={categories || []} 
      subCategories={subCategories || []} 
      levels={levels || []}
      ownedCourseIds={ownedCourseIds}
    />
  );
}