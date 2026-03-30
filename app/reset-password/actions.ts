"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updatePasswordAction(formData: FormData) {
  const password = (formData.get("password") as string) || "";
  const confirm = (formData.get("confirm") as string) || "";

  if (!password || password.length < 6) return { error: "Password minimal 6 karakter." };
  if (password !== confirm) return { error: "Konfirmasi password tidak sama." };

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return { error: "Sesi reset tidak valid. Silakan ulangi dari link email reset." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  // Setelah update password, arahkan user ke dashboard (atau login bila kamu prefer).
  redirect("/dashboard");
}

