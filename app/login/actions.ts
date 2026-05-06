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
  
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";
  
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) return { error: "Email atau password salah." };
  
  return { success: true, redirectUrl: callbackUrl };
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  
  // Berikan nilai default karena form input di UI sudah dihapus
  const phone = (formData.get("phone") as string) || "-";
  const address = (formData.get("address") as string) || "-";

  const supabase = await createClient();

  if (!email || !password) return { error: "Email dan password wajib diisi." };
  if (!full_name || full_name.trim().length < 2) return { error: "Nama lengkap minimal 2 karakter." };
  
  // VALIDASI PHONE DAN ADDRESS DIHAPUS DARI SINI

  const siteUrl =
    (await getRequestOrigin()) ||
    normalizeSiteUrl(formData.get("siteUrl")) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    "https://www.klaskonstruksi.com";

  // 1. Daftarkan user ke sistem Auth Supabase.
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
        console.error("Profile upsert gagal:", profileError.message);
      }
    }
  }

  return { success: "Pendaftaran berhasil! Silakan cek email untuk verifikasi, lalu login." };
}

export async function signInWithGoogle(callbackUrl: string = "/dashboard") {
  const supabase = await createClient();
  
  const siteUrl =
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || "https://www.klaskonstruksi.com";
  
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