"use server";
export const runtime = 'edge';

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

    if (profile?.role !== "admin") {
      return { error: "Akses ilegal. Hanya admin yang dapat merilis e-book." };
    }
    // =========================================================================

    // 1. Ambil data dari form
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const goals = formData.get("goals") as string;
    const keypoints = formData.getAll("keypoints") as string[]; 
    const bintang = parseFloat(formData.get("bintang") as string) || 5.0;
    const jml_review = parseInt(formData.get("jml_review") as string) || 0;
    const terjual = parseInt(formData.get("terjual") as string) || 0;
    
    const file = formData.get("pdf_file") as File;
    const coverFile = formData.get("cover_image") as File; // Ambil file cover

    let pdfUrl = "";
    let coverUrl = "";

    // 2A. Upload PDF ke Supabase Storage (Bucket bernama: 'ebooks')
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("ebooks").upload(filePath, file);
      if (uploadError) return { error: `Gagal upload PDF: ${uploadError.message}` };

      const { data: { publicUrl } } = supabase.storage.from("ebooks").getPublicUrl(filePath);
      pdfUrl = publicUrl;
    }

    // 2B. Upload Cover Image ke Storage yang sama
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split('.').pop();
      const coverName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
      const coverPath = `covers/${coverName}`;

      const { error: uploadError } = await supabase.storage.from("ebooks").upload(coverPath, coverFile);
      if (uploadError) return { error: `Gagal upload Cover: ${uploadError.message}` };

      const { data: { publicUrl } } = supabase.storage.from("ebooks").getPublicUrl(coverPath);
      coverUrl = publicUrl;
    }

    // 3. Simpan data ke tabel 'ebooks' di database Supabase
    const { data, error } = await supabase
      .from("ebooks") 
      .insert([
        {
          title: title,
          price: price,
          goals: goals,
          keypoints: keypoints,
          rating: bintang,
          reviews_count: jml_review,
          sold_count: terjual,
          pdf_url: pdfUrl,
          cover_url: coverUrl, // Simpan URL Cover
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