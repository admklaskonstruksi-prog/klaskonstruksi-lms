"use client";

import { useState } from "react";
// Pastikan import action Anda sesuai dengan nama file tempat Anda menyimpan createLesson
import { createChapter, deleteChapter, deleteLesson } from "../actions";
import { createLesson } from "../../lessons-actions"; 
import { Plus, Trash2, FileText, ChevronDown, ChevronUp, Loader2, PlayCircle, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link"; 

export default function ChaptersList({ initialData, courseId }: { initialData: any[], courseId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);

  // --- HANDLER BAB (SECTION) ---
  async function handleAddChapter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("courseId", courseId);

    const res = await createChapter(formData);
    if (res?.error) toast.error(res.error);
    else {
        toast.success("Bab baru ditambahkan");
        (e.target as HTMLFormElement).reset();
    }
    setIsLoading(false);
  }

  // --- HANDLER MATERI (VIDEO UPLOAD KE BUNNY) ---
  async function handleAddLesson(e: React.FormEvent<HTMLFormElement>, chapterId: string) {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Menyiapkan file video...");
    
    try {
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        const file = formData.get("video") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;

        if (!file || file.size === 0) {
            throw new Error("Silakan pilih file video terlebih dahulu!");
        }

        // 1. Dapatkan Slot Video & API Key dari backend Bunny kita
        toast.loading("Mereservasi slot di Bunny.net...", { id: toastId });
        const bunnyRes = await fetch("/api/bunny/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });
        
        const bunnyData = await bunnyRes.json();
        if (!bunnyRes.ok) throw new Error(bunnyData.error || "Gagal menghubungi Bunny.net");

        const { videoId, libraryId, apiKey } = bunnyData;

        // 2. Upload video LANGSUNG dari Browser ke Bunny.net (Bypass Vercel limit)
        toast.loading("Mengupload video... Jangan tutup halaman ini.", { id: toastId });
        const uploadRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
            method: "PUT",
            headers: {
                "AccessKey": apiKey,
                "Content-Type": "application/octet-stream"
            },
            body: file
        });

        if (!uploadRes.ok) throw new Error("Gagal mengupload file ke server Bunny.net");

        // 3. Simpan data ke database Supabase
        toast.loading("Menyimpan materi ke kurikulum...", { id: toastId });
        
        // Buat FormData baru khusus untuk database
        const dbFormData = new FormData();
        dbFormData.append("course_id", courseId);
        dbFormData.append("chapter_id", chapterId); // Sangat Penting!
        dbFormData.append("title", title);
        dbFormData.append("description", description);
        dbFormData.append("video_id", videoId); // Masukkan ID dari Bunny

        const res = await createLesson(dbFormData);

        if (res?.error) {
            throw new Error(res.error);
        }

        toast.success("Video materi berhasil ditambahkan!", { id: toastId });
        formElement.reset();
        setAddingLessonTo(null); // Tutup form
        
    } catch (error: any) {
        toast.error(error.message || "Terjadi kesalahan saat upload", { id: toastId });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* BAGIAN 1: LIST BAB DAN MATERI */}
      <div className="space-y-4">
        {initialData.length === 0 && (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm">Belum ada kurikulum.</p>
                <p className="text-xs mt-1">Buat bab baru di bawah untuk memulai.</p>
            </div>
        )}

        {initialData.map((chapter) => (
          <div key={chapter.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            
            <div className="p-4 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                <div 
                    className="flex-1 flex items-center gap-3 cursor-pointer" 
                    onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                >
                    {expandedChapter === chapter.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    <h4 className="font-bold text-gray-800">Bagian {chapter.position}: {chapter.title}</h4>
                </div>
                <button onClick={() => { if(confirm("Hapus bab ini beserta SEMUA isinya?")) deleteChapter(chapter.id, courseId) }} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                </button>
            </div>

            {expandedChapter === chapter.id && (
                <div className="p-4 space-y-3">
                    {chapter.lessons?.sort((a: any, b: any) => a.position - b.position).map((lesson: any) => (
                        <div key={lesson.id} className="flex items-start justify-between bg-white border border-gray-100 p-4 rounded-lg hover:shadow-sm transition">
                            <div className="flex items-start gap-3">
                                <PlayCircle size={20} className="text-[#00C9A7] mt-1 flex-shrink-0" />
                                <div>
                                    <h5 className="font-semibold text-gray-900">{lesson.position}. {lesson.title}</h5>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{lesson.description}</p>
                                </div>
                            </div>
                            <button onClick={() => { if(confirm("Hapus materi ini?")) deleteLesson(lesson.id, courseId) }} className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-4">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {/* Form Tambah Video */}
                    {addingLessonTo === chapter.id ? (
                        <form onSubmit={(e) => handleAddLesson(e, chapter.id)} className="bg-green-50/50 border border-green-100 p-4 rounded-lg space-y-4 mt-4">
                            <h5 className="font-semibold text-sm text-[#00C9A7]">Tambah Materi Baru</h5>
                            <input name="title" required placeholder="Judul Materi (misal: Intro to React)" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-[#00C9A7]" />
                            <textarea name="description" required placeholder="Deskripsi singkat materi..." rows={2} className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:border-[#00C9A7]" />
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <input type="file" name="video" accept="video/*" required className="w-full sm:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#00C9A7] file:text-white hover:file:bg-[#00b894] cursor-pointer" />
                                <div className="flex-1 w-full flex justify-end gap-2 mt-2 sm:mt-0">
                                    <button type="button" onClick={() => setAddingLessonTo(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md">Batal</button>
                                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md flex items-center gap-2">
                                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Mulai Upload Video
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setAddingLessonTo(chapter.id)} className="flex items-center gap-2 text-sm font-medium text-[#00C9A7] hover:bg-green-50 px-4 py-2 rounded-lg mt-2 transition">
                            <Plus size={16} /> Tambah Materi Video
                        </button>
                    )}
                </div>
            )}
          </div>
        ))}
      </div>

      {/* BAGIAN 2: FORM TAMBAH BAB BARU */}
      <form onSubmit={handleAddChapter} className="bg-white border border-gray-200 border-dashed rounded-xl p-4 flex gap-3 items-center">
        <input name="title" required placeholder="Nama Bab Baru (misal: Pengantar)" disabled={isLoading} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00C9A7]" />
        <button type="submit" disabled={isLoading} className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm whitespace-nowrap">
           {isLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} Tambah Bab
        </button>
      </form>

      {/* BAGIAN 3: TOMBOL SELESAI */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-xl">
          <div className="text-sm text-gray-500">
             <p className="font-medium text-gray-700">Selesai Mengedit?</p>
             <p>Semua perubahan tersimpan otomatis.</p>
          </div>
          
          <Link 
            href="/dashboard/courses" 
            className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            <Save size={18} /> 
            Selesai & Kembali
          </Link>
      </div>

    </div>
  );
}