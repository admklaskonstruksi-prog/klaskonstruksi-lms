"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- MAIN CATEGORY ACTIONS ---
export async function createMainCategory(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Nama kategori wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase.from("main_categories").insert([{ name }]);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/courses/create");
}

export async function deleteMainCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  const { error } = await supabase.from("main_categories").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
}

// --- SUB CATEGORY ACTIONS ---
export async function createSubCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const main_category_id = formData.get("main_category_id") as string;
  
  if (!name || !main_category_id) return { error: "Nama dan Main Kategori wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase.from("sub_categories").insert([{ name, main_category_id }]);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/courses/create");
}

export async function deleteSubCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  const { error } = await supabase.from("sub_categories").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
}

// --- LEVEL ACTIONS ---
export async function createLevel(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Nama level wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase.from("course_levels").insert([{ name }]);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/courses/create");
}

export async function deleteLevel(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  const { error } = await supabase.from("course_levels").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
}