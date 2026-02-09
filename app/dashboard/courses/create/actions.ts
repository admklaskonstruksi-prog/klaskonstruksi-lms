"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createNewCourse(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Ambil data text
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const level = formData.get("level") as string;
  const category_id = formData.get("category_id") as string;
  
  // Ambil status publish (checkbox mengembalikan 'on' jika dicentang)
  const is_published = formData.get("is_published") === "on";

  // 2. PROSES UPLOAD GAMBAR (Cover)
  const thumbnailFile = formData.get("thumbnail") as File;
  let thumbnail_url = "";

  if (thumbnailFile && thumbnailFile.size > 0) {
    // Buat nama file unik (biar gak bentrok)
    const fileName = `${Date.now()}-${thumbnailFile.name.replaceAll(" ", "_")}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("covers") // Pastikan nama bucket sesuai langkah 1
      .upload(fileName, thumbnailFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      return { error: "Gagal upload gambar: " + uploadError.message };
    }

    // Ambil URL Publiknya
    const { data: urlData } = supabase.storage
      .from("covers")
      .getPublicUrl(fileName);
      
    thumbnail_url = urlData.publicUrl;
  }

  // 3. Simpan ke Database
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      description,
      price,
      level,
      category_id: category_id || null,
      is_published: is_published, // Status sesuai pilihan user
      thumbnail_url: thumbnail_url, // URL gambar dari storage
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // 4. Redirect ke Langkah Selanjutnya (Setup Materi)
  revalidatePath("/dashboard/courses");
  redirect(`/dashboard/courses/${data.id}`);
}