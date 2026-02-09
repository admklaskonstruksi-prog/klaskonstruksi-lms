"use client";

import { useState } from "react";
import { createChapter, deleteChapter, updateChapter } from "../actions";
import { 
  Pencil, Trash2, Plus, Loader2, Video, FileVideo, 
  GripVertical, CheckCircle2, X, ArrowLeft, Save
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link"; // <--- IMPORT PENTING

interface Chapter {
  id: string;
  title: string;
  position: number;
  is_published: boolean;
  video_id?: string | null;
}

interface ChaptersListProps {
  initialData: Chapter[];
  courseId: string;
}

export default function ChaptersList({ initialData, courseId }: ChaptersListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // --- FUNGSI TAMBAH ---
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.append("courseId", courseId);

      const result = await createChapter(formData);

      if (result?.error) {
        toast.error("Gagal: " + result.error);
      } else {
        toast.success("Berhasil! Video & Modul tersimpan.");
        (event.target as HTMLFormElement).reset();
        setIsExpanded(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsCreating(false);
    }
  }

  // --- FUNGSI HAPUS ---
  const handleDelete = async (chapterId: string) => {
    if (!confirm("Yakin hapus modul ini beserta videonya?")) return;
    const loadingToast = toast.loading("Sedang menghapus...");
    try {
      await deleteChapter(chapterId, courseId);
      toast.success("Modul dihapus", { id: loadingToast });
      router.refresh();
    } catch {
      toast.error("Gagal menghapus", { id: loadingToast });
    }
  };

  // --- FUNGSI EDIT ---
  const handleUpdate = async (chapterId: string) => {
    if (!editTitle.trim()) return;
    try {
      await updateChapter(chapterId, courseId, editTitle);
      setEditingId(null);
      toast.success("Judul diupdate");
      router.refresh();
    } catch {
      toast.error("Gagal update judul");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* BAGIAN 1: TOMBOL TAMBAH */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-black hover:text-black transition-all bg-gray-50 hover:bg-white group"
        >
          <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
             <Plus className="w-5 h-5 text-gray-600" />
          </div>
          <span className="font-medium">Tambah Modul & Video Baru</span>
        </button>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-900 flex items-center gap-2">
               <Video size={20} className="text-blue-600"/> Upload Materi Baru
             </h3>
             <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600">
               <X size={20} />
             </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700">Judul Modul / Bab</label>
                <input
                  name="title"
                  required
                  type="text"
                  placeholder="Contoh: Pengenalan Tools Dasar"
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700">File Video (MP4)</label>
                <div className="mt-1 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                    <FileVideo className="text-gray-400 flex-shrink-0" />
                    <input
                      name="video"
                      type="file"
                      accept="video/*"
                      required
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1">Video akan diupload otomatis ke Bunny.net.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 font-medium"
                >
                  {isCreating ? <Loader2 className="animate-spin w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                  {isCreating ? "Sedang Mengupload..." : "Simpan Video"}
                </button>
            </div>
          </form>
        </div>
      )}

      {/* BAGIAN 2: LIST MODUL */}
      <div className="space-y-3">
        {initialData.length === 0 && !isExpanded && (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm">Belum ada modul materi.</p>
                <p className="text-xs mt-1">Silakan klik tombol tambah di atas.</p>
            </div>
        )}

        {initialData.map((chapter) => (
          <div key={chapter.id} className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className="cursor-move text-gray-300 hover:text-gray-500">
                <GripVertical size={20} />
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm">
                {chapter.position}
              </div>
              
              <div className="flex-1">
                {editingId === chapter.id ? (
                  <div className="flex items-center gap-2">
                      <input 
                          value={editTitle} 
                          onChange={(e)=>setEditTitle(e.target.value)} 
                          className="border border-blue-300 px-3 py-1.5 rounded-lg w-full outline-none"
                          autoFocus
                      />
                      <button onClick={() => handleUpdate(chapter.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">Simpan</button>
                  </div>
                ) : (
                  <div>
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{chapter.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          {chapter.video_id ? (
                             <span className="text-[10px] sm:text-xs text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                                <CheckCircle2 size={12} /> Video Ready
                             </span>
                          ) : (
                             <span className="text-[10px] sm:text-xs text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 font-medium">
                                <Video size={12} /> Belum ada Video
                             </span>
                          )}
                      </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l ml-2">
                <button onClick={() => { setEditingId(chapter.id); setEditTitle(chapter.title); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(chapter.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* BAGIAN 3: TOMBOL SELESAI (BARU) */}
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