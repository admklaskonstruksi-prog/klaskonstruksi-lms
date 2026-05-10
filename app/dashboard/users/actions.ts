"use server";

import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// INISIALISASI ADMIN CLIENT
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// SECURITY FIX: Helper otorisasi admin
async function verifyAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Akses ditolak: Anda belum login.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Akses ditolak: Hanya Admin yang dapat melakukan tindakan ini.");
  }
  return supabase;
}

export async function updateUserRole(userId: string, newRole: string) {
    try {
        const supabase = await verifyAdminAccess();
        const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
        
        if (error) return { error: error.message };
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteUserRecord(userId: string) {
    try {
        await verifyAdminAccess(); // Tetap wajib cek admin meski pakai supabaseAdmin di bawahnya

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (error) {
            console.error("Gagal menghapus user:", error.message);
            return { error: "Gagal menghapus pengguna. Pastikan kunci server valid." };
        }
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}