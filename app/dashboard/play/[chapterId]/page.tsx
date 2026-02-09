import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MissionTerminal from "./MissionTerminal";

// Helper untuk cek validitas UUID (mencegah error database jika ID aneh)
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export default async function PlayerPage({ params }: { params: { chapterId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // REVISI 1: Handle params dengan await (untuk Next.js versi baru) dan validasi
  // Kadang params bisa jadi Promise di versi Next.js tertentu
  const resolvedParams = await params; 
  const { chapterId } = resolvedParams;

  // REVISI 2: Validasi ID sebelum Query
  if (!chapterId || !isValidUUID(chapterId)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0505] text-red-500 font-mono">
        Error: Invalid Mission ID (UUID format required). 
        <br/> Received: {chapterId || "NULL"}
      </div>
    );
  }

  // 1. Cek Akses (Enrollment)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("chapter_id", chapterId)
    .maybeSingle(); // Gunakan maybeSingle agar tidak error jika null

  // Opsional: Redirect jika belum beli
  // if (!enrollment) redirect("/dashboard");

  // 2. Fetch Detail Chapter
  // REVISI 3: Gunakan .maybeSingle() agar tidak throw error jika data kosong
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id, title, level") 
    .eq("id", chapterId)
    .maybeSingle();

  if (chapterError) {
    console.error("Error fetching chapter:", chapterError);
    return <div className="p-10 text-white font-mono">Database Error: {chapterError.message}</div>;
  }

  if (!chapter) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-[#0a0505] text-white">
            <h1 className="text-3xl font-bold mb-2">404 - Mission Not Found</h1>
            <p className="text-gray-500">Data chapter tidak ditemukan di database.</p>
            <p className="text-xs text-gray-700 mt-4 font-mono">ID: {chapterId}</p>
        </div>
    );
  }

  // 3. Fetch Lessons (Materi Video) — include duration untuk progress bar
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, title, description, video_id, duration, position, created_at")
    .eq("chapter_id", chapterId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <MissionTerminal 
       chapter={chapter} 
       lessons={lessons || []} 
    />
  );
}