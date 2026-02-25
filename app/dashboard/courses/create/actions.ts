"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createNewCourse(formData: FormData) {
  const supabase = await createClient();

  // 1. Ambil data teks standar dari form
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price")) || 0;
  
  const is_published = formData.get("is_published") === "on";
  
  // 2. Ambil 3 ID hierarki
  const main_category_id = formData.get("main_category_id") as string;
  const sub_category_id = formData.get("sub_category_id") as string;
  const level_id = formData.get("level_id") as string;

  // Validasi sederhana
  if (!title || !main_category_id || !sub_category_id || !level_id) {
      return { error: "Judul, Kategori Utama, Sub Kategori, dan Level wajib diisi!" };
  }

  // 3. LOGIKA UPLOAD THUMBNAIL (Sudah Diaktifkan)
  const thumbnailFile = formData.get("thumbnail") as File;
  let thumbnail_url = null;

  if (thumbnailFile && thumbnailFile.size > 0) {
    // Buat nama file unik
    const fileName = `${Date.now()}-${thumbnailFile.name.replaceAll(" ", "_")}`;
    
    // Upload ke bucket 'covers' di Supabase
    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(fileName, thumbnailFile, { upsert: false });

    if (uploadError) {
      console.error("Gagal upload gambar saat buat kelas:", uploadError);
      return { error: "Gagal mengupload gambar. Pastikan bucket 'covers' di Supabase sudah ada dan disetting Public." };
    }

    // Dapatkan URL publik gambar
    const { data: urlData } = supabase.storage.from("covers").getPublicUrl(fileName);
    thumbnail_url = urlData.publicUrl;
  }

  // 4. Simpan semua data ke tabel courses
  const { data: newCourse, error } = await supabase
    .from("courses")
    .insert([
      {
        title,
        description,
        price,
        is_published,
        main_category_id, 
        sub_category_id,  
        level_id,         
        thumbnail_url     // Simpan URL gambar ke database
      }
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Error saat membuat kelas:", error);
    return { error: error.message };
  }

  // 5. Redirect pengguna ke halaman edit/materi
  redirect(`/dashboard/courses/${newCourse.id}`);
}