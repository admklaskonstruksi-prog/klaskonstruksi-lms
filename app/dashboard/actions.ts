"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * REVISI KEAMANAN: 
 * 1. Menghapus argumen 'price' dari client untuk mencegah manipulasi harga.
 * 2. Mengambil harga asli langsung dari database (Single Source of Truth).
 */
export async function purchaseChapter(courseId: string, chapterId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. AMBIL HARGA ASLI DARI DATABASE (Anti-Manipulation)
  // Asumsi: Harga disimpan di tabel 'chapters' atau 'courses'
  const { data: chapterData, error: chapterError } = await supabase
    .from("chapters") // Sesuaikan dengan nama tabel materi kamu
    .select("price")
    .eq("id", chapterId)
    .single();

  if (chapterError || !chapterData) {
    return { error: "Materi tidak ditemukan atau harga belum diatur." };
  }

  const verifiedPrice = chapterData.price;

  // 2. CEK KEPEMILIKAN (Mencegah double enrollment)
  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("chapter_id", chapterId)
    .single();

  if (existingEnrollment) {
    return { success: true, message: "Module already unlocked" };
  }

  // 3. INSERT KE ENROLLMENTS
  const { error: enrollmentError } = await supabase
    .from("enrollments")
    .insert({
      user_id: user.id,
      course_id: courseId, 
      chapter_id: chapterId,
      status: 'active',
      progress: 0
    });

  if (enrollmentError) {
    console.error("Enrollment error:", enrollmentError);
    if (enrollmentError.code === '23505') return { success: true };
    return { error: `Gagal Enroll: ${enrollmentError.message}` };
  }

  // 4. INSERT REVENUE DENGAN HARGA TERVERIFIKASI
  const { error: revenueError } = await supabase
    .from("purchases")
    .insert({
        user_id: user.id,
        course_id: courseId,
        chapter_id: chapterId,
        amount: verifiedPrice, // Menggunakan harga dari DB, bukan dari client
        created_at: new Date().toISOString()
    });

  if (revenueError) {
    console.error("Revenue recording error:", revenueError);
  }

  revalidatePath("/dashboard/learning-path");
  return { success: true };
}

export async function completeMission(chapterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return { error: "Unauthorized" };
  
    const { error } = await supabase
      .from("enrollments")
      .update({ 
        status: "completed",
        progress: 100 
      })
      .eq("user_id", user.id)
      .eq("chapter_id", chapterId);
  
    if (error) return { error: error.message };
    
    revalidatePath("/dashboard/learning-path");
    return { success: true };
}

/**
 * REVISI KEAMANAN:
 * Menambahkan validasi range progress (0-100) untuk mencegah data sampah.
 */
export async function updateLessonProgress(chapterId: string, progress: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return { error: "Unauthorized" };

    // Validasi input: pastikan progress tetap di antara 0 - 100
    const validatedProgress = Math.max(0, Math.min(100, progress));
  
    const { error } = await supabase
      .from("enrollments")
      .update({ progress: validatedProgress })
      .eq("user_id", user.id)
      .eq("chapter_id", chapterId);
  
    if (error) return { error: error.message };
    
    return { success: true };
}