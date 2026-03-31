import { createClient } from "@/utils/supabase/server";
import ProgramCatalogClient from "./ProgramCatalogClient";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const supabase = await createClient();

  // 1. Cek Kepemilikan
  const { data: { user } } = await supabase.auth.getUser();
  let ownedCourseIds: string[] = [];
  
  if (user) {
    const { data: myEnrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
    ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];
  }

  // 2. QUERY AMAN: Tarik semua master data bersamaan
  const [
    { data: categories },
    { data: subCategories },
    { data: levels },
    { data: rawCourses, error } // FILTER IS_PUBLISHED DIHAPUS DISINI
  ] = await Promise.all([
    supabase.from("main_categories").select("id, name").order("name"),
    supabase.from("sub_categories").select("id, name, main_category_id").order("name"),
    supabase.from("course_levels").select("id, name").order("id"),
    supabase.from("courses").select("*").order("created_at", { ascending: false }) 
  ]);

  if (error) console.error("Error fetching courses:", error.message);

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