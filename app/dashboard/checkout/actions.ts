"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function enrollUser(courseId: string, amount: number) {
  const supabase = await createClient();

  // 1. Ambil User Login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Anda belum login." };

  // 2. Simpan Data ke Tabel
  // Kita pakai 'upsert' agar kalau sudah punya, tidak error duplikat
  const { error } = await supabase.from("enrollments").upsert({
    user_id: user.id,
    course_id: courseId,
    amount_paid: amount,
  }, {
    onConflict: 'user_id, course_id' // Abaikan jika data kembar
  });

  if (error) {
    console.error("Gagal Enroll:", error.message);
    return { error: error.message };
  }

  // 3. Refresh Halaman Terkait
  revalidatePath(`/dashboard/learning-path/${courseId}`);
  revalidatePath(`/dashboard/checkout/${courseId}`);
  
  return { success: true };
}