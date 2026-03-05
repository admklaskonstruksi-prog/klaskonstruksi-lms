"use server";

import { createClient } from "@/utils/supabase/server";

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // Tangkap callbackUrl dari input hidden/formData, default ke /dashboard
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";
  
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) return { error: "Email atau password salah." };
  
  // Jangan gunakan redirect() di sini, kembalikan URL ke client untuk di-push
  return { success: true, redirectUrl: callbackUrl };
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

// Tambahkan parameter callbackUrl
export async function signInWithGoogle(callbackUrl: string = "/dashboard") {
  const supabase = await createClient();
  
  // Mengambil URL dari env, jika tidak ada baru pakai fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.klaskonstruksi.com';
  
  // Pastikan URL callback lengkap dan membawa parameter 'next' yang dinamis
  const redirectUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(callbackUrl)}`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) return { error: error.message };
  
  // Kembalikan URL OAuth Google ke client
  if (data.url) return { success: true, url: data.url };
}