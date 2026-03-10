"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- COURSE ACTIONS ---

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const category_id = formData.get("category_id") as string;
  const difficulty = formData.get("difficulty") as string;
  
  if (!category_id) return { error: "Kategori harus dipilih." };

  const { data, error } = await supabase
    .from("courses")
    .insert({ title, description, price, category_id, difficulty })
    .select()
    .single();

  if (error) return { error: error.message };
  redirect(`/dashboard/courses/${data.id}`);
}

export async function updateCourse(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));
  const category_id = formData.get("category_id") as string;
  const difficulty = formData.get("difficulty") as string;
  const thumbnailFile = formData.get("thumbnail") as File;

  const updates: any = { 
    title, 
    price, 
    category_id, 
    difficulty,
    updated_at: new Date().toISOString()
  };

  if (thumbnailFile && thumbnailFile.size > 0) {
    const fileName = `${Date.now()}-${thumbnailFile.name.replace(/\s+/g, '-')}`;
    
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(fileName, thumbnailFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { error: "Gagal upload gambar: " + uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName);

    updates.thumbnail_url = urlData.publicUrl;
  }

  const { error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/courses");
  return { success: true };
}

export async function deleteCourse(formData: FormData) {
  const supabase = await createClient();
  const courseId = formData.get("id") as string;

  if (!courseId) return { error: "ID Kelas tidak ditemukan" };

  await supabase.from("enrollments").delete().eq("course_id", courseId);
  
  const { data: chapters } = await supabase.from("chapters").select("id").eq("course_id", courseId);
  const chapterIds = chapters?.map(c => c.id) || [];

  if (chapterIds.length > 0) {
    await supabase.from("lessons").delete().in("chapter_id", chapterIds);
  }
  
  await supabase.from("chapters").delete().eq("course_id", courseId);

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/courses");
  return { success: true };
}

// --- LESSON ACTIONS ---

export async function deleteLesson(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("id") as string;
  
  if (!lessonId) return { error: "ID Lesson tidak ditemukan" };

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  
  if (error) return { error: error.message };
  
  return { success: true };
}

export async function saveLesson(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string; 
  const chapter_id = formData.get("chapter_id") as string;
  const title = formData.get("title") as string;
  const video_id = formData.get("video_id") as string;
  const description = formData.get("description") as string;

  if (!title || !video_id) {
    return { error: "Judul dan Video ID wajib diisi" };
  }

  let error;

  if (id && id !== "undefined") {
    const res = await supabase.from("lessons").update({ title, video_id, description }).eq("id", id);
    error = res.error;
  } else {
    if (!chapter_id) return { error: "Chapter ID hilang" };
    const res = await supabase.from("lessons").insert({ chapter_id, title, video_id, description });
    error = res.error;
  }

  if (error) return { error: error.message };
  
  return { success: true };
}

import { uploadVideoToBunny } from "./bunnyUtils";
export { uploadVideoToBunny };

// --- TAMBAHAN BARU: TOGGLE STATUS KELAS CEPAT ---
export async function toggleCourseStatus(courseId: string, newStatus: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("courses")
    .update({ is_published: newStatus })
    .eq("id", courseId);

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/courses"); 
  return { success: true };
}

// --- TAMBAHAN BARU: TOGGLE RATING ASLI / DUMMY ---
export async function toggleDummyRating(id: string, tableName: string, newStatus: boolean) {
  const supabase = await createClient();
  
  // KITA TAMBAHKAN .select() UNTUK MEMAKSA SUPABASE MENGEMBALIKAN HASILNYA
  const { data, error } = await supabase
    .from(tableName)
    .update({ use_dummy_rating: newStatus })
    .eq("id", id)
    .select(); // <--- INI KUNCI PENTINGNYA

  if (error) {
    return { error: error.message };
  }

  // JIKA ROW YANG DIUPDATE = 0, BERARTI DATABASE MEMBLOKIRNYA
  if (!data || data.length === 0) {
    return { error: "Update Ditolak Database: RLS memblokir aksi ini atau kolom belum siap." };
  }
  
  // Refresh seluruh rute secara agresif
  revalidatePath("/", "layout"); 
  
  return { success: true };
}