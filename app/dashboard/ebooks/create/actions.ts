"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEbookAction(formData: FormData) {
  try {
    const supabase = await createClient();

    // =========================================================================
    // 1. SECURITY: Proteksi Hak Akses (Cek Login & Role Admin)
    // =========================================================================
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Akses ditolak. Anda belum login." };
    }

    // Cek role user di tabel profiles (Gunakan .toLowerCase() agar lebih aman)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role?.toLowerCase() !== "admin") {
      return { error: "Akses ilegal. Hanya admin yang dapat merilis e-book." };
    }
    // =========================================================================

    // 2. Ambil data dari form (SINKRONISASI DENGAN NAMA DI UI)
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const description = formData.get("goals") as string; // Di UI namanya 'goals', tapi di DB/Edit pakai 'description'
    const keypoints = formData.getAll("keypoints") as string[]; 
    const sold_count = parseInt(formData.get("terjual") as string) || 0;
    
    const file = formData.get("pdf_file") as File | null;
    const coverFile = formData.get("cover_image") as File | null;

    let file_url = "";
    let thumbnail_url = "";

    // 3A. Upload PDF ke Supabase Storage (Bucket bernama: 'ebooks')
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("ebooks").upload(filePath, file);
      if (uploadError) return { error: `Gagal upload PDF: ${uploadError.message}` };

      const { data: { publicUrl } } = supabase.storage.from("ebooks").getPublicUrl(filePath);
      file_url = publicUrl; // Menggunakan nama 'file_url' sesuai dengan halaman Edit
    }

    // 3B. Upload Cover Image ke Storage yang sama
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split('.').pop();
      const coverName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
      const coverPath = `covers/${coverName}`;

      const { error: uploadError } = await supabase.storage.from("ebooks").upload(coverPath, coverFile);
      if (uploadError) return { error: `Gagal upload Cover: ${uploadError.message}` };

      const { data: { publicUrl } } = supabase.storage.from("ebooks").getPublicUrl(coverPath);
      thumbnail_url = publicUrl; // Menggunakan nama 'thumbnail_url' sesuai dengan halaman Edit
    }

    // 4. Simpan data ke tabel 'ebooks' di database Supabase
    const { data, error } = await supabase
      .from("ebooks") 
      .insert([
        {
          title: title,
          price: price,
          description: description, 
          keypoints: keypoints,
          sold_count: sold_count,
          file_url: file_url,             // Diperbaiki
          thumbnail_url: thumbnail_url,   // Diperbaiki
          dummy_rating: 5.0,              // Default rating sesuai SQL yang kita buat
          dummy_rating_count: 0,
          use_dummy_rating: true,         // Default menggunakan dummy
          is_published: true              // Otomatis Live setelah diunggah
        }
      ])
      .select()
      .single();

    if (error) {
      return { error: `Gagal simpan ke database: ${error.message}` };
    }

    // Wajib dibuka komentarnya agar tabel admin langsung ter-refresh
    revalidatePath("/dashboard/ebooks"); 
    return { success: true, data };

  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}