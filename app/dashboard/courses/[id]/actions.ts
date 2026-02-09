"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadVideoToBunny, deleteVideoFromBunny } from "../bunnyUtils"; 
// Pastikan path "../bunnyUtils" benar. Jika file bunnyUtils ada di folder 'courses', maka path ini benar.

// 1. TAMBAH MODUL + UPLOAD
export async function createChapter(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const courseId = formData.get("courseId") as string;
  const videoFile = formData.get("video") as File;

  // Cek urutan
  const { count } = await supabase
    .from("chapters")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);
  const newPosition = (count || 0) + 1;

  // --- PROSES UPLOAD KE BUNNY ---
  let videoId = null;

  if (videoFile && videoFile.size > 0) {
    // Kita panggil fungsi upload dengan 2 parameter: File dan Judul
    const uploadedId = await uploadVideoToBunny(videoFile, title);
    
    if (!uploadedId) {
        return { error: "Gagal mengupload video ke Server Bunny. Cek koneksi/API Key." };
    }
    videoId = uploadedId; // ID berhasil didapat
  }

  // --- SIMPAN KE SUPABASE ---
  const { error } = await supabase.from("chapters").insert({
    title: title,
    course_id: courseId,
    position: newPosition,
    is_published: true,
    video_id: videoId, // Simpan ID Bunny di sini
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}

// 2. HAPUS MODUL
export async function deleteChapter(chapterId: string, courseId: string) {
  const supabase = await createClient();

  // Ambil video_id dulu sebelum dihapus datanya
  const { data: chapter } = await supabase
    .from("chapters")
    .select("video_id")
    .eq("id", chapterId)
    .single();

  // Hapus data di database
  const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
  if (error) return { error: error.message };

  // Hapus video fisik di Bunny (Clean up)
  if (chapter?.video_id) {
      await deleteVideoFromBunny(chapter.video_id);
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true };
}

// 3. EDIT JUDUL
export async function updateChapter(chapterId: string, courseId: string, newTitle: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("chapters").update({ title: newTitle }).eq("id", chapterId);
    if (error) return { error: error.message };
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
}

// ... (Kode sebelumnya: createChapter, deleteChapter dll BIARKAN SAJA) ...

// --- TAMBAHAN BARU: UPDATE DETAIL KELAS ---
export async function updateCourseDetails(formData: FormData) {
  const supabase = await createClient();
  
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const level = formData.get("level") as string;
  const category_id = formData.get("category_id") as string;
  const is_published = formData.get("is_published") === "on";

  // LOGIKA UPDATE GAMBAR (Cover)
  const thumbnailFile = formData.get("thumbnail") as File;
  let thumbnail_url = formData.get("old_thumbnail_url") as string; // Pakai URL lama kalau tidak upload baru

  if (thumbnailFile && thumbnailFile.size > 0) {
    const fileName = `${Date.now()}-${thumbnailFile.name.replaceAll(" ", "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(fileName, thumbnailFile, { upsert: false });

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("covers").getPublicUrl(fileName);
      thumbnail_url = urlData.publicUrl;
    }
  }

  // UPDATE DATA KE DATABASE
  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description,
      price,
      level,
      category_id: category_id || null,
      is_published,
      thumbnail_url,
    })
    .eq("id", courseId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/dashboard/courses"); // Refresh daftar kelas juga
  return { success: true };
}