"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLessonComplete(courseId: string, lessonId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (isCompleted) {
    const { error } = await supabase.from("user_progress").upsert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      is_completed: true
    }, { onConflict: 'user_id, lesson_id' });
    
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("user_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
      
    if (error) return { error: error.message };
  }

  return { success: true };
}

// --- FUNGSI BARU: SIMPAN RATING & HITUNG RATA-RATA ---
export async function submitCourseRating(courseId: string, rating: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Anda harus login untuk memberi rating." };
  if (rating < 1 || rating > 5) return { error: "Rating tidak valid." };

  // 1. Simpan atau Update Rating Siswa
  const { error: reviewError } = await supabase.from("reviews").upsert({
    user_id: user.id,
    course_id: courseId,
    rating: rating,
    created_at: new Date().toISOString()
  }, { onConflict: 'user_id, course_id' }); // Cegah duplikasi, cukup update jika sudah ada

  if (reviewError) {
    console.error("Gagal menyimpan review:", reviewError);
    return { error: reviewError.message };
  }

  // 2. Ambil seluruh rating untuk kelas ini
  const { data: allReviews, error: fetchError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("course_id", courseId);

  if (fetchError) return { error: fetchError.message };

  // 3. Hitung Kalkulasi Rata-rata Bintang
  const totalReviews = allReviews.length;
  const sumRatings = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = totalReviews > 0 ? (sumRatings / totalReviews) : 0;

  // 4. Simpan ke tabel `courses` agar tampil di katalog
  const { error: updateError } = await supabase
    .from("courses")
    .update({
      rating: averageRating,
      review_count: totalReviews
    })
    .eq("id", courseId);

  if (updateError) return { error: updateError.message };

  // 5. Bersihkan cache halaman terkait agar bintang langsung berubah
  revalidatePath(`/dashboard/learning-path/${courseId}`);
  revalidatePath('/dashboard/my-courses');
  revalidatePath('/program');
  revalidatePath(`/program/${courseId}`);
  revalidatePath("/");

  return { success: true };
}