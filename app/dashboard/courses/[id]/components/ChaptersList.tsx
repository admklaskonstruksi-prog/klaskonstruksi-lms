"use client";

import { useState, useTransition } from "react";
import { createChapter, deleteChapter, createLesson, deleteLesson, updateLesson } from "../actions";
import { Trash2, Plus, PlayCircle, ChevronDown, ChevronUp, Loader2, Video, Edit3, X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  initialData: any[];
  courseId: string;
}

export default function ChaptersList({ initialData, courseId }: Props) {
  const [expandedChapters, setExpandedChapters] = useState<string[]>(initialData.map(ch => ch.id));
  const [isPending, startTransition] = useTransition();

  // State untuk Tambah Bab
  const [newChapterTitle, setNewChapterTitle] = useState("");

  // State untuk Tambah Materi (Lesson)
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);

  // State untuk Edit Materi (Lesson)
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
    );
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return toast.error("Judul bab tidak boleh kosong");
    const formData = new FormData();
    formData.append("title", newChapterTitle);
    formData.append("courseId", courseId);

    startTransition(async () => {
      const result = await createChapter(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Bab berhasil ditambahkan!");
        setNewChapterTitle("");
      }
    });
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Yakin ingin menghapus bab ini beserta seluruh isinya?")) return;
    startTransition(async () => {
      const result = await deleteChapter(chapterId, courseId);
      if (result.error) toast.error(result.error);
      else toast.success("Bab berhasil dihapus!");
    });
  };

  const handleAddLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingLessonTo) return;
    const formData = new FormData(e.currentTarget);
    formData.append("chapterId", addingLessonTo);
    formData.append("courseId", courseId);

    startTransition(async () => {
      const result = await createLesson(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Materi berhasil ditambahkan!");
        setAddingLessonTo(null);
      }
    });
  };

  const handleEditLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLesson) return;
    const formData = new FormData(e.currentTarget);
    formData.append("lessonId", editingLesson.id);
    formData.append("courseId", courseId);

    startTransition(async () => {
      const result = await updateLesson(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Materi berhasil diperbarui!");
        setEditingLesson(null);
      }
    });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;
    startTransition(async () => {
      const result = await deleteLesson(lessonId, courseId);
      if (result.error) toast.error(result.error);
      else toast.success("Materi berhasil dihapus!");
    });
  };

  return (
    <div className="space-y-4">
      
      {initialData.map((chapter, index) => (
        <div key={chapter.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all">
          
          {/* Chapter Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <button onClick={() => toggleChapter(chapter.id)} className="flex items-center gap-3 flex-1 text-left font-bold text-gray-800">
              {expandedChapters.includes(chapter.id) ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
              Bagian {index + 1}: {chapter.title}
            </button>
            <button onClick={() => handleDeleteChapter(chapter.id)} disabled={isPending} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
              <Trash2 size={16} />
            </button>
          </div>

          {/* Chapter Content (Lessons) */}
          {expandedChapters.includes(chapter.id) && (
            <div className="border-t border-gray-100 p-4 space-y-3">
              {chapter.lessons?.length === 0 ? (
                <p className="text-sm text-gray-400 italic px-4 py-2">Belum ada materi di bab ini.</p>
              ) : (
                chapter.lessons.map((lesson: any, lIndex: number) => (
                  <div key={lesson.id} className="flex items-start justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-[#00C9A7]/30 transition group">
                    <div className="flex items-start gap-3">
                      <PlayCircle size={18} className="text-[#00C9A7] mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{lIndex + 1}. {lesson.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{lesson.description}</p>
                        {lesson.video_id && (
                          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <Video size={10} /> Video Terlampir
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Aksi Materi (Edit & Delete) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingLesson(lesson)} 
                        disabled={isPending} 
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Materi"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)} 
                        disabled={isPending} 
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Materi"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <button 
                onClick={() => setAddingLessonTo(chapter.id)}
                className="flex items-center gap-2 text-sm font-bold text-[#00C9A7] hover:text-[#00b596] p-2 transition w-max mt-2"
              >
                <Plus size={16} /> Tambah Materi Video
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Tambah Bab Baru */}
      <div className="flex items-center gap-2 mt-6 bg-white p-4 rounded-xl border border-gray-200 border-dashed">
        <input 
          type="text" 
          value={newChapterTitle} 
          onChange={(e) => setNewChapterTitle(e.target.value)} 
          placeholder="Nama Bab Baru (misal: Pengantar)" 
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"
        />
        <button 
          onClick={handleAddChapter} 
          disabled={isPending || !newChapterTitle.trim()}
          className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Tambah Bab"}
        </button>
      </div>

      {/* MODAL TAMBAH MATERI (LESSON) */}
      {addingLessonTo && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setAddingLessonTo(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Plus className="text-[#00C9A7]"/> Tambah Materi Baru</h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Materi</label>
                <input name="title" required type="text" placeholder="Contoh: Konsep Dasar" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Video ID (BunnyCDN)</label>
                <input name="videoId" type="text" placeholder="Contoh: d1bff247-cd78-..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm font-mono" />
                <p className="text-[10px] text-gray-400 mt-1">Opsional. Kosongkan jika ini materi teks/bacaan.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea name="description" rows={3} placeholder="Materi ini membahas tentang..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setAddingLessonTo(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Batal</button>
                <button type="submit" disabled={isPending} className="bg-[#00C9A7] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00b596] shadow-lg shadow-[#00C9A7]/20 transition disabled:opacity-50 flex items-center gap-2">
                  {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Simpan Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT MATERI (LESSON) */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setEditingLesson(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Edit3 className="text-blue-500"/> Edit Materi</h3>
            <form onSubmit={handleEditLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Materi</label>
                <input name="title" defaultValue={editingLesson.title} required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Video ID (BunnyCDN)</label>
                <input name="videoId" defaultValue={editingLesson.video_id || ""} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea name="description" defaultValue={editingLesson.description || ""} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingLesson(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Batal</button>
                <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition disabled:opacity-50 flex items-center gap-2">
                  {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}