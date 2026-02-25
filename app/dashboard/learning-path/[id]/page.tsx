import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CoursePlayer from "../components/CoursePlayer";

interface Props {
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ chapterId?: string }>;
}

export default async function LearningPathPage(props: Props) {
  const params = await props.params;
  const courseId = params.id; 
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment) {
    return redirect(`/dashboard/checkout/${courseId}`); 
  }

  const { data: course } = await supabase
    .from("courses")
    .select(`*, chapters (*, lessons (*))`)
    .eq("id", courseId)
    .single();

  if (!course) return <div className="p-10 text-center">Kelas tidak ditemukan</div>;

  const sortedChapters = (course.chapters || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((chapter: any) => ({
      ...chapter,
      lessons: (chapter.lessons || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    }));

  const { data: relatedCourses } = await supabase
    .from("courses")
    .select("id, title, price, thumbnail_url, level")
    .eq("category_id", course.category_id) 
    .neq("id", course.id) 
    .eq("is_published", true)
    .limit(3);

  // --- BARU: AMBIL DATA PROGRES SISWA ---
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId);
    
  // Buat array yang isinya hanya ID lesson yang sudah selesai
  const completedLessonIds = progressData?.map(p => p.lesson_id) || [];

  return (
    <CoursePlayer 
      course={course} 
      chapters={sortedChapters} 
      relatedCourses={relatedCourses || []} 
      completedLessonIds={completedLessonIds} // Kirim data progres ke komponen
    />
  );
}