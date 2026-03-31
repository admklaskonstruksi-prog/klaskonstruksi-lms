"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

function normalizeSiteUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

async function getRequestOrigin(): Promise<string | null> {
  // Saat dipanggil dari client, `origin` kadang ada. Kalau tidak, pakai `referer`.
  const hdrs = await headers();
  const originHeader = hdrs.get("origin");
  const referer = hdrs.get("referer");

  const normalizedOrigin = normalizeSiteUrl(originHeader);
  if (normalizedOrigin) return normalizedOrigin;

  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      // ignore
    }
  }

  return null;
}

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

  if (!email || !password) return { error: "Email dan password wajib diisi." };
  if (!full_name || full_name.trim().length < 2) return { error: "Nama lengkap minimal 2 karakter." };
  if (!phone || phone.trim().length < 6) return { error: "No. WhatsApp tidak valid." };
  if (!address || address.trim().length < 2) return { error: "Kota/Domisili wajib diisi." };

  const siteUrl =
    (await getRequestOrigin()) ||
    normalizeSiteUrl(formData.get("siteUrl")) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    "https://www.klaskonstruksi.com";

  // 1. Daftarkan user ke sistem Auth Supabase.
  // Simpan data penting di user_metadata agar tidak tergantung insert ke tabel profiles (yang sering kena RLS saat email confirmation aktif).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
      data: {
        full_name,
        phone,
        address,
        role: "siswa",
      },
    },
  });

  if (error) return { error: error.message };

  // 2. Simpan data ke tabel profiles jika memungkinkan.
  // Catatan: pada konfigurasi Supabase yang mewajibkan verifikasi email, session bisa null → RLS bisa menolak insert/update.
  if (data.user) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name,
        phone,
        address,
        role: "siswa",
      });
      if (profileError) {
        // Jangan gagalkan signup kalau hanya gagal tulis profile.
        console.error("Profile upsert gagal:", profileError.message);
      }
    }
  }

  // Jika email confirmation aktif, Supabase biasanya minta user klik link di email dulu.
  return { success: "Pendaftaran berhasil! Silakan cek email untuk verifikasi, lalu login." };
}

// Tambahkan parameter callbackUrl
export async function signInWithGoogle(callbackUrl: string = "/dashboard") {
  const supabase = await createClient();
  
  // Prioritaskan origin yang sedang dipakai user (biar tidak nyasar ke www.klaskonstruksi.com kalau domainnya beda).
  // Fallback ke env, lalu fallback terakhir.
  const siteUrl =
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || "https://www.klaskonstruksi.com";
  
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

export async function signInWithGoogleFromSite(
  callbackUrl: string = "/dashboard",
  siteUrlFromClient?: string
) {
  const supabase = await createClient();

  const siteUrl =
    (await getRequestOrigin()) ||
    normalizeSiteUrl(siteUrlFromClient) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    "https://www.klaskonstruksi.com";

  const redirectUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(callbackUrl)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) return { error: error.message };
  if (data.url) return { success: true, url: data.url };
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  if (!email) return { error: "Email wajib diisi." };

  const supabase = await createClient();
  const siteUrl =
    (await getRequestOrigin()) ||
    normalizeSiteUrl(formData.get("siteUrl")) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    "https://www.klaskonstruksi.com";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  if (error) return { error: error.message };
  return { success: "Link reset password sudah dikirim. Cek inbox/spam email kamu." };
}