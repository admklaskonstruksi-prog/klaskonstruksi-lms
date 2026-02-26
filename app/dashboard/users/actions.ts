"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    
    if (error) return { error: error.message };
    
    revalidatePath("/dashboard/users");
    return { success: true };
}

export async function deleteUserRecord(userId: string) {
    const supabase = await createClient();
    // Mengamankan data: menghapus profil akan menonaktifkan akunnya dari UI dashboard.
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    
    if (error) return { error: error.message };
    
    revalidatePath("/dashboard/users");
    return { success: true };
}