"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// SECURITY FIX: Helper otorisasi admin
async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Akses ditolak: Anda belum login.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Akses ditolak: Hanya Admin.");
  
  return supabase;
}

// --- MAIN CATEGORY ACTIONS ---
export async function createMainCategory(formData: FormData) {
  try {
    const supabase = await verifyAdminAccess();
    const name = formData.get("name") as string;
    if (!name) return { error: "Nama kategori wajib diisi" };

    const { error } = await supabase.from("main_categories").insert([{ name }]);
    if (error) return { error: error.message };
  } catch (err: any) { return { error: err.message }; }
}

export async function deleteMainCategory(formData: FormData) {
  try {
    const supabase = await verifyAdminAccess();
    const id = formData.get("id") as string;
    const { error } = await supabase.from("main_categories").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch (err: any) { return { error: err.message }; }
}

// --- SUB CATEGORY ACTIONS ---
export async function createSubCategory(formData: FormData) {
  try {
    const supabase = await verifyAdminAccess();
    const name = formData.get("name") as string;
    const main_category_id = formData.get("main_category_id") as string;
    
    if (!name || !main_category_id) return { error: "Nama dan Main Kategori wajib diisi" };

    const { error } = await supabase.from("sub_categories").insert([{ name, main_category_id }]);
    if (error) return { error: error.message };
  } catch (err: any) { return { error: err.message }; }
}

export async function deleteSubCategory(formData: FormData) {
  try {
    const supabase = await verifyAdminAccess();
    const id = formData.get("id") as string;
    const { error } = await supabase.from("sub_categories").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch (err: any) { return { error: err.message }; }
}

// --- LEVEL ACTIONS ---
export async function createLevel(formData: FormData) {
  try {
    const supabase = await verifyAdminAccess();
    const name = formData.get("name") as string;
    if (!name) return { error: "Nama level wajib diisi" };

    const { error } = await supabase.from("course_levels").insert([{ name }]);
    if (error) return { error: error.message };
  } catch (err: any) { return { error: err.message }; }
}

export async function deleteLevel(formData: FormData) {
  try {
    const supabase = await verifyAdminAccess();
    const id = formData.get("id") as string;
    const { error } = await supabase.from("course_levels").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch (err: any) { return { error: err.message }; }
}