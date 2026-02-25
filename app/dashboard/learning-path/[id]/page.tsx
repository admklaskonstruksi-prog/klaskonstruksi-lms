import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CoursePlayer from "../components/CoursePlayer";

interface Props {
  // PENTING: Karena nama folder Anda [id], di sini harus id
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ chapterId?: string }>;
}

export default async function LearningPathPage(props: Props) {
  const params = await props.params;
  
  // KITA AMBIL 'id' DARI URL, LALU KITA SIMPAN SEBAGAI 'courseId' BIAR KONSISTEN
  const courseId = params.id; 

  const supabase = await createClient();

  // 1. Cek User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 2. Cek Enrollment (Apakah siswa sudah beli?)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId) // Cek pakai ID yang benar
    .single();

  if (!enrollment) {
    // Jika belum beli, lempar ke halaman checkout
    return redirect(`/dashboard/checkout/${courseId}`); 
  }

  // 3. Ambil Data Course, Chapters, DAN Lessons
  // KUNCI PERBAIKAN: Kita harus ambil tabel lessons juga
  const { data: course } = await supabase
    .from("courses")
    .select(`
        *,
        chapters (
            *,
            lessons (*)
        )
    `)
    .eq("id", courseId)
    .single();

  if (!course) return <div className="p-10 text-center">Kelas tidak ditemukan</div>;

  // Urutkan chapter dan lesson berdasarkan posisi
  const sortedChapters = (course.chapters || [])
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((chapter: any) => ({
      ...chapter,
      lessons: (chapter.lessons || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    }));

  // 4. FITUR REKOMENDASI (Cross-Selling)
  const { data: relatedCourses } = await supabase
    .from("courses")
    .select("id, title, price, thumbnail_url, level")
    .eq("category_id", course.category_id) 
    .neq("id", course.id) 
    .eq("is_published", true)
    .limit(3);

  // --- RENDER (Serahkan ke Client Component agar interaktif) ---
  return (
    <CoursePlayer 
      course={course} 
      chapters={sortedChapters} 
      relatedCourses={relatedCourses || []} 
    />
  );
}