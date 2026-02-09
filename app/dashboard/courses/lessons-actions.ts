"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createLesson(formData: FormData) {
  const supabase = await createClient();

  // Check user and role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden: Admin only" };
  }

  // Get form data
  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const videoId = formData.get("video_id") as string;
  const duration = parseInt(formData.get("duration") as string) || 0;
  const isPreview = formData.get("is_preview") === "true";
  const isPublished = formData.get("is_published") === "true";

  // Validation
  if (!courseId) {
    return { error: "Course ID is required" };
  }

  if (!title || title.trim().length < 2) {
    return { error: "Title must be at least 2 characters" };
  }

  // Get next position
  const { data: lastLesson } = await supabase
    .from("lessons")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const nextPosition = (lastLesson?.position || 0) + 1;

  // Insert lesson
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      course_id: courseId,
      title: title.trim(),
      description: description?.trim() || null,
      video_id: videoId || null,
      duration,
      position: nextPosition,
      is_preview: isPreview,
      is_published: isPublished,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/dashboard/courses/${courseId}/edit`);
  return { success: true, lesson: data };
}

export async function updateLesson(lessonId: string, formData: FormData) {
  const supabase = await createClient();

  // Check user and role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden: Admin only" };
  }

  // Get form data
  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const videoId = formData.get("video_id") as string;
  const duration = parseInt(formData.get("duration") as string) || 0;
  const isPreview = formData.get("is_preview") === "true";
  const isPublished = formData.get("is_published") === "true";

  // Validation
  if (!title || title.trim().length < 2) {
    return { error: "Title must be at least 2 characters" };
  }

  // Update lesson
  const { error } = await supabase
    .from("lessons")
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      video_id: videoId || null,
      duration,
      is_preview: isPreview,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId);

  if (error) {
    console.error("Error updating lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/dashboard/courses/${courseId}/edit`);
  return { success: true };
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient();

  // Check user and role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden: Admin only" };
  }

  // Delete lesson
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) {
    console.error("Error deleting lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/dashboard/courses/${courseId}/edit`);
  return { success: true };
}

export async function reorderLessons(
  courseId: string,
  lessonIds: string[]
) {
  const supabase = await createClient();

  // Check user and role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden: Admin only" };
  }

  // Update positions
  const updates = lessonIds.map((id, index) =>
    supabase
      .from("lessons")
      .update({ position: index + 1 })
      .eq("id", id)
  );

  await Promise.all(updates);

  revalidatePath(`/dashboard/courses/${courseId}/edit`);
  return { success: true };
}

export async function getLessons(courseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching lessons:", error);
    return { error: error.message, lessons: [] };
  }

  return { lessons: data || [] };
}
