"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function enrollUser(courseId: string) {
  const supabase = await createClient();

  // 1. Ambil User Login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Anda belum login." };

  // 2. SECURITY FIX: Ambil harga asli dari database, JANGAN percaya input dari browser
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("price")
    .eq("id", courseId)
    .single();

  if (courseError || !courseData) {
    return { error: "Data kursus tidak ditemukan atau tidak valid." };
  }

  const verifiedAmount = courseData.price;

  // 3. Simpan Data ke Tabel
  const { error } = await supabase.from("enrollments").upsert({
    user_id: user.id,
    course_id: courseId,
    amount_paid: verifiedAmount, // Menggunakan harga terverifikasi
  }, {
    onConflict: 'user_id, course_id' // Abaikan jika data kembar
  });

  if (error) {
    console.error("Gagal Enroll:", error.message);
    return { error: error.message };
  }

  //revalidatePath(`/dashboard/learning-path/${courseId}`);
  //revalidatePath(`/dashboard/checkout/${courseId}`);
  //revalidatePath(`/dashboard/my-courses`); 
  
  return { success: true };
}