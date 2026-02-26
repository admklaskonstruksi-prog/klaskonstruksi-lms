"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) return { error: "Email atau password salah." };
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const supabase = await createClient();

  // 1. Daftarkan user ke sistem Auth Supabase
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };

  // 2. Simpan data lengkap ke tabel profiles
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name,
      phone,
      address,
      role: 'siswa' // Otomatis jadi siswa
    });
  }

  return { success: "Pendaftaran berhasil! Silakan masuk dengan akun Anda." };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
}