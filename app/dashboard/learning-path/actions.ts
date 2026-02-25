"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLessonComplete(courseId: string, lessonId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (isCompleted) {
    // Tandai selesai (Insert/Update)
    const { error } = await supabase.from("user_progress").upsert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      is_completed: true
    }, { onConflict: 'user_id, lesson_id' });
    
    if (error) return { error: error.message };
  } else {
    // Batal selesai (Hapus dari database)
    const { error } = await supabase.from("user_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
      
    if (error) return { error: error.message };
  }

  // Refresh halaman agar checkmark dan bar progres ter-update
  revalidatePath(`/dashboard/learning-path/${courseId}`);
  revalidatePath('/dashboard/my-courses');
  return { success: true };
}