"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  // Mendaftarkan user ke Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "siswa", // Default role untuk pendaftar baru
      },
    },
  });

  if (error) {
    // Jika gagal (email sudah dipakai, password kurang panjang, dll)
    return redirect(`/register?message=${error.message}`);
  }

  // Jika sukses, arahkan ke halaman login dengan pesan sukses
  return redirect("/register/success");
}