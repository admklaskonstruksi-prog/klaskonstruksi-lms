"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { deleteVideoFromBunny } from "../bunnyUtils"; 

// ==========================================
// SECURITY FIX: HELPER UNTUK CEK OTORISASI ADMIN
// ==========================================
async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized: Anda belum login.");

  // Opsional tapi sangat disarankan: Cek role user di tabel profiles
  // Pastikan hanya admin yang bisa melakukan aksi CRUD kursus
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden: Hanya Admin yang diizinkan mengubah materi.");
  }

  return { supabase, user };
}

export async function createChapter(formData: FormData) {
  try {
    const { supabase } = await verifyAdminAccess();
    const title = formData.get("title") as string;
    const courseId = formData.get("courseId") as string;
    
    const { count } = await supabase.from("chapters").select("*", { count: "exact", head: true }).eq("course_id", courseId);
    
    const { error } = await supabase.from("chapters").insert({
      title, course_id: courseId, position: (count || 0) + 1, is_published: true,
    });
    if (error) return { error: error.message };
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteChapter(chapterId: string, courseId: string) {
  try {
    const { supabase } = await verifyAdminAccess();
    const { data: lessons } = await supabase.from("lessons").select("video_id").eq("chapter_id", chapterId);
    
    const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
    if (error) return { error: error.message };
    
    if (lessons) {
      for (const lesson of lessons) {
        if (lesson.video_id) await deleteVideoFromBunny(lesson.video_id);
      }
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateChapter(chapterId: string, courseId: string, newTitle: string) {
  try {
    const { supabase } = await verifyAdminAccess();
    const { error } = await supabase.from("chapters").update({ title: newTitle }).eq("id", chapterId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createLesson(formData: FormData) {
  try {
    const { supabase } = await verifyAdminAccess();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const chapterId = formData.get("chapterId") as string;
    const videoId = formData.get("videoId") as string; 
    
    const { count } = await supabase.from("lessons").select("*", { count: "exact", head: true }).eq("chapter_id", chapterId);

    const { error } = await supabase.from("lessons").insert({
      title, description, chapter_id: chapterId, position: (count || 0) + 1, is_published: true, video_id: videoId,
    });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateLesson(formData: FormData) {
  try {
    const { supabase } = await verifyAdminAccess();
    const lessonId = formData.get("lessonId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const videoId = formData.get("videoId") as string; 

    const { error } = await supabase.from("lessons").update({
      title, 
      description, 
      video_id: videoId,
    }).eq("id", lessonId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  try {
    const { supabase } = await verifyAdminAccess();
    const { data: lesson } = await supabase.from("lessons").select("video_id").eq("id", lessonId).single();
    
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) return { error: error.message };
    
    if (lesson?.video_id) await deleteVideoFromBunny(lesson.video_id);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function saveCourseContent(formData: FormData) {
  try {
    const { supabase } = await verifyAdminAccess();
    
    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const goals = formData.get("goals") as string; 
    const keypoints = formData.get("keypoints") as string; 
    
    // SECURITY FIX: Validasi agar harga tidak negatif
    const price = Math.max(0, Number(formData.get("price")) || 0);
    const strike_price = Math.max(0, Number(formData.get("strike_price")) || 0); 
    
    const rating = Number(formData.get("rating")) || 0; 
    const review_count = Number(formData.get("review_count")) || 0; 
    const sales_count = Number(formData.get("sales_count")) || 0; 
    const is_published = formData.get("is_published") === "on";

    const level_id = formData.get("level_id") as string;
    const main_category_id = formData.get("main_category_id") as string;
    const sub_category_id = formData.get("sub_category_id") as string; 

    const thumbnailFile = formData.get("thumbnail") as File;
    let thumbnail_url = formData.get("old_thumbnail_url") as string; 

    // Upload Thumbnail handling...
    if (thumbnailFile && thumbnailFile.size > 0) {
      const fileName = `${Date.now()}-${thumbnailFile.name.replaceAll(" ", "_")}`;
      const { error: uploadError } = await supabase.storage.from("covers").upload(fileName, thumbnailFile, { upsert: false });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("covers").getPublicUrl(fileName);
        thumbnail_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("courses")
      .update({ 
          title, description, goals, keypoints,    
          price, strike_price,
          rating, review_count, sales_count,
          is_published, thumbnail_url,
          level_id: level_id || null, 
          main_category_id: main_category_id || null, 
          sub_category_id: sub_category_id || null 
      })
      .eq("id", courseId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleCoursePublish(courseId: string, currentStatus: boolean) {
    try {
      const { supabase } = await verifyAdminAccess();
      const { error } = await supabase
          .from("courses")
          .update({ is_published: !currentStatus })
          .eq("id", courseId);

      if (error) return { error: error.message };
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
}