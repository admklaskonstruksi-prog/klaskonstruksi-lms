"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. SECURITY FIX: Validasi Ketat di Server (Server-Side Validation)
  // Menolak string kosong dan membatasi panjang karakter
  if (!fullName || fullName.trim().length < 3 || fullName.length > 50) {
    return redirect("/register?message=Nama lengkap harus antara 3 hingga 50 karakter.");
  }

  // Validasi format email menggunakan Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return redirect("/register?message=Format email tidak valid.");
  }

  // Minimal standar keamanan password
  if (!password || password.length < 6) {
    return redirect("/register?message=Password minimal 6 karakter.");
  }

  const supabase = await createClient();

  // Mendaftarkan user ke Supabase Auth
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(), // Sanitasi spasi berlebih
        role: "siswa", // Default role (Aman dari injeksi client)
      },
    },
  });

  if (error) {
    // 2. SECURITY FIX: Sembunyikan error asli dari user, tampilkan error yang aman
    console.error("Supabase SignUp Error:", error.message); // Log untuk dev/admin saja
    
    let userFriendlyMessage = "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.";
    
    // Pemetaan error (Error Mapping)
    if (error.message.toLowerCase().includes("already registered")) {
      userFriendlyMessage = "Email sudah terdaftar. Silakan menuju halaman login.";
    } else if (error.message.toLowerCase().includes("password")) {
      userFriendlyMessage = "Password terlalu lemah atau tidak memenuhi syarat.";
    }

    return redirect(`/register?message=${encodeURIComponent(userFriendlyMessage)}`);
  }

  // Jika sukses, arahkan ke halaman login dengan pesan sukses
  return redirect("/register/success");
}