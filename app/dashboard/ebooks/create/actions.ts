"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEbookAction(formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. Ambil data dari form
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const goals = formData.get("goals") as string;
    const keypoints = formData.getAll("keypoints") as string[]; // Berupa array
    const bintang = parseFloat(formData.get("bintang") as string) || 4.6;
    const jml_review = parseInt(formData.get("jml_review") as string) || 0;
    const terjual = parseInt(formData.get("terjual") as string) || 0;
    
    const file = formData.get("pdf_file") as File;

    let pdfUrl = "";

    // 2. Upload PDF ke Supabase Storage (Bucket bernama: 'ebooks')
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      // Buat nama file unik agar tidak bentrok
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ebooks") 
        .upload(filePath, file);

      if (uploadError) {
        return { error: `Gagal upload PDF: ${uploadError.message}` };
      }

      // Dapatkan URL publik dari file yang diupload
      const { data: { publicUrl } } = supabase.storage
        .from("ebooks")
        .getPublicUrl(filePath);
        
      pdfUrl = publicUrl;
    }

    // 3. Simpan data ke tabel 'ebooks' di database Supabase
    const { data, error } = await supabase
      .from("ebooks") 
      .insert([
        {
          title: title,
          price: price,
          goals: goals,
          keypoints: keypoints, // Supabase otomatis mendeteksi tipe Array
          rating: bintang,
          reviews_count: jml_review,
          sold_count: terjual,
          pdf_url: pdfUrl,
        }
      ])
      .select()
      .single();

    if (error) {
      return { error: `Gagal simpan ke database: ${error.message}` };
    }

    // Bersihkan cache Next.js agar data baru langsung muncul di tabel
    revalidatePath("/dashboard/ebooks");
    
    return { success: true, data };

  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}