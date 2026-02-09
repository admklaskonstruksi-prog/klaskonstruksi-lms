"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  
  if (!name) return { error: "Nama kategori wajib diisi" };

  const { error } = await supabase.from("categories").insert({ name });

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  // 1. Cek apakah kategori dipakai oleh course?
  const { count } = await supabase
    .from("courses")
    .select("*", { count: 'exact', head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return { error: `Gagal! Kategori ini sedang digunakan oleh ${count} kelas.` };
  }

  // 2. Hapus jika aman
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/categories");
  return { success: true };
}