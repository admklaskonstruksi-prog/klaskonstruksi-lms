"use server";

import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// INISIALISASI ADMIN CLIENT
// Klien ini memiliki wewenang absolut untuk memodifikasi sistem otentikasi Supabase
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ditarik dari .env.local
);

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    
    if (error) return { error: error.message };
    
    revalidatePath("/dashboard/users");
    return { success: true };
}

export async function deleteUserRecord(userId: string) {
    // PERBAIKAN: Gunakan auth.admin untuk menghapus user secara permanen.
    // Ini akan menghapus data di auth.users, dan otomatis menyapu bersih
    // data di tabel profiles, enrollments, dan user_progress (karena CASCADE).
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
        console.error("Gagal menghapus user:", error.message);
        return { error: "Gagal menghapus pengguna. Pastikan SUPABASE_SERVICE_ROLE_KEY sudah terpasang." };
    }
    
    revalidatePath("/dashboard/users");
    return { success: true };
}