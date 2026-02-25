"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveOnboardingResult(level: string, interestId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("profiles")
        .update({
            onboarding_completed: true, // Tandai selesai agar tidak muncul lagi
            recommended_level: level,
            interest_id: interestId
        })
        .eq("id", user.id);

    if (error) return { error: error.message };

    // Refresh halaman agar data baru terbaca
    revalidatePath("/dashboard");
    return { success: true };
}