import { createClient } from "@/utils/supabase/server";
import ProgramCatalogClient from "./ProgramCatalogClient";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const supabase = await createClient();

  // 1. Cek Kepemilikan (Jika Login)
  const { data: { user } } = await supabase.auth.getUser();
  let ownedCourseIds: string[] = [];
  
  if (user) {
    const { data: myEnrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
    ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];
  }

  // 2. Ambil Master Data Kategori
  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");
  const { data: subCategories } = await supabase.from("sub_categories").select("id, name, main_category_id").order("name");
  const { data: levels } = await supabase.from("course_levels").select("id, name").order("id");

  // 3. QUERY AMAN: Tarik data kelas tanpa relasi tabel (Menghindari Error Foreign Key)
  const { data: rawCourses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) console.error("Error fetching courses:", error.message);

  // 4. Mapping Manual (Menyambungkan nama kategori secara manual tanpa membebani Supabase)
  const courses = (rawCourses || []).map((course) => ({
    ...course,
    main_categories: categories?.find((c) => c.id === course.main_category_id) || null,
    sub_categories: subCategories?.find((s) => s.id === course.sub_category_id) || null,
    course_levels: levels?.find((l) => l.id === course.level_id) || null,
  }));

  return (
    <ProgramCatalogClient 
      courses={courses} 
      mainCategories={categories || []} 
      subCategories={subCategories || []} 
      levels={levels || []}
      ownedCourseIds={ownedCourseIds}
    />
  );
}