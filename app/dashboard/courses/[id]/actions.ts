"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { deleteVideoFromBunny } from "../bunnyUtils"; 

export async function createChapter(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const courseId = formData.get("courseId") as string;
  const { count } = await supabase.from("chapters").select("*", { count: "exact", head: true }).eq("course_id", courseId);
  
  const { error } = await supabase.from("chapters").insert({
    title, course_id: courseId, position: (count || 0) + 1, is_published: true,
  });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}

export async function deleteChapter(chapterId: string, courseId: string) {
  const supabase = await createClient();
  const { data: lessons } = await supabase.from("lessons").select("video_id").eq("chapter_id", chapterId);
  const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
  if (error) return { error: error.message };
  if (lessons) {
    for (const lesson of lessons) {
      if (lesson.video_id) await deleteVideoFromBunny(lesson.video_id);
    }
  }
  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}

export async function updateChapter(chapterId: string, courseId: string, newTitle: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("chapters").update({ title: newTitle }).eq("id", chapterId);
    if (error) return { error: error.message };
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
}

export async function createLesson(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const chapterId = formData.get("chapterId") as string;
  const courseId = formData.get("courseId") as string;
  const videoId = formData.get("videoId") as string; 
  const { count } = await supabase.from("lessons").select("*", { count: "exact", head: true }).eq("chapter_id", chapterId);

  const { error } = await supabase.from("lessons").insert({
    title, description, chapter_id: chapterId, position: (count || 0) + 1, is_published: true, video_id: videoId,
  });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient();
  const { data: lesson } = await supabase.from("lessons").select("video_id").eq("id", lessonId).single();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { error: error.message };
  if (lesson?.video_id) await deleteVideoFromBunny(lesson.video_id);
  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}

// ==========================================
// 3. FUNGSI BARU UNTUK MEMAKSA NEXT.JS REFRESH CACHE
// ==========================================
export async function saveCourseContent(formData: FormData) {
  const supabase = await createClient();
  
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  
  // Tangkap data
  const goals = formData.get("goals") as string; 
  const keypoints = formData.get("keypoints") as string; 
  const price = Number(formData.get("price"));
  const is_published = formData.get("is_published") === "on";

  const thumbnailFile = formData.get("thumbnail") as File;
  let thumbnail_url = formData.get("old_thumbnail_url") as string; 

  if (thumbnailFile && thumbnailFile.size > 0) {
    const fileName = `${Date.now()}-${thumbnailFile.name.replaceAll(" ", "_")}`;
    const { error: uploadError } = await supabase.storage.from("covers").upload(fileName, thumbnailFile, { upsert: false });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("covers").getPublicUrl(fileName);
      thumbnail_url = urlData.publicUrl;
    }
  }

  // Update ke DB
  const { error } = await supabase
    .from("courses")
    .update({ 
        title, 
        description, 
        goals,        
        keypoints,    
        price, 
        is_published, 
        thumbnail_url 
    })
    .eq("id", courseId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/dashboard/courses"); 
  return { success: true };
}