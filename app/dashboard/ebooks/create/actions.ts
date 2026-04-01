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

    // Cek role user di tabel profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role?.toLowerCase() !== "admin") {
      return { error: "Akses ilegal. Hanya admin yang dapat merilis e-book." };
    }
    // =========================================================================

    // 2. Ambil data dari form
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const description = formData.get("goals") as string; 
    const keypoints = formData.getAll("keypoints") as string[]; 
    
    // MENANGKAP NILAI DUMMY RATING
    const sold_count = parseInt(formData.get("terjual") as string) || 0;
    const dummy_rating = parseFloat(formData.get("dummy_rating") as string) || 5.0;
    const dummy_rating_count = parseInt(formData.get("dummy_rating_count") as string) || 0;
    
    const file = formData.get("pdf_file") as File | null;
    const coverFile = formData.get("cover_image") as File | null;

    let pdf_url = ""; 
    let thumbnail_url = "";

    // 3A. Upload PDF ke Supabase Storage (Bucket bernama: 'ebooks')
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("ebooks").upload(filePath, file);
      if (uploadError) return { error: `Gagal upload PDF: ${uploadError.message}` };

      const { data: { publicUrl } } = supabase.storage.from("ebooks").getPublicUrl(filePath);
      pdf_url = publicUrl; 
    }

    // 3B. Upload Cover Image ke Storage yang sama
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split('.').pop();
      const coverName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
      const coverPath = `covers/${coverName}`;

      const { error: uploadError } = await supabase.storage.from("ebooks").upload(coverPath, coverFile);
      if (uploadError) return { error: `Gagal upload Cover: ${uploadError.message}` };

      const { data: { publicUrl } } = supabase.storage.from("ebooks").getPublicUrl(coverPath);
      thumbnail_url = publicUrl; 
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
          
          pdf_url: pdf_url,               
          pdf_file_url: pdf_url,          
          thumbnail_url: thumbnail_url,   
          cover_url: thumbnail_url,       
          created_by: user.id,            
          
          // ---- FITUR DUMMY RATING DISUNTIKKAN KE SINI ----
          rating: dummy_rating,           // Mengisi rating utama agar langsung tampil di depan
          reviews_count: dummy_rating_count, // Mengisi review count utama
          dummy_rating: dummy_rating,     // Mengisi kolom dummy
          dummy_rating_count: dummy_rating_count,
          use_dummy_rating: true,         
          // ------------------------------------------------
          
          is_published: true              
        }
      ])
      .select()
      .single();

    if (error) {
      return { error: `Gagal simpan ke database: ${error.message}` };
    }

    revalidatePath("/dashboard/ebooks"); 
    return { success: true, data };

  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}