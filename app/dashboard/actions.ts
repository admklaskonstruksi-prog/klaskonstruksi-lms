"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function purchaseChapter(courseId: string, chapterId: string, price: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. CEK KEPEMILIKAN (Mencegah error duplicate key jika user klik 2x)
  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("chapter_id", chapterId)
    .single();

  if (existingEnrollment) {
    return { success: true, message: "Module already unlocked" };
  }

  // 2. INSERT KE ENROLLMENTS (Akses Materi)
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
    // Handle specific constraint violations gracefully if needed
    if (enrollmentError.code === '23505') { 
        return { success: true }; // Anggap sukses jika ternyata sudah ada
    }
    return { error: `Gagal Enroll: ${enrollmentError.message}` };
  }

  // 3. INSERT REVENUE / DATA TRANSAKSI (Agar muncul di Analytic)
  // Pastikan tabel 'purchases' sudah dibuat di database sesuai query SQL di atas
  const { error: revenueError } = await supabase
    .from("purchases")
    .insert({
        user_id: user.id,
        course_id: courseId,
        chapter_id: chapterId,
        amount: price, // Harga yang dibayar
        created_at: new Date().toISOString()
    });

  if (revenueError) {
    // Kita log error revenue, tapi jangan gagalkan proses user karena user sudah dapat course
    console.error("Revenue recording error:", revenueError);
  }

  revalidatePath("/dashboard");
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

export async function updateLessonProgress(chapterId: string, progress: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return { error: "Unauthorized" };
  
    const { error } = await supabase
      .from("enrollments")
      .update({ progress: progress })
      .eq("user_id", user.id)
      .eq("chapter_id", chapterId);
  
    if (error) return { error: error.message };
    
    revalidatePath("/dashboard/learning-path");
    return { success: true };
}