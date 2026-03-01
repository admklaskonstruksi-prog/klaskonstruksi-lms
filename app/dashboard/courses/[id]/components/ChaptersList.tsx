"use client";

import { useState, useTransition, useEffect } from "react";
import { createChapter, deleteChapter } from "../actions";
import { createLesson, deleteLesson, updateLesson } from "../../lessons-actions";
import { Trash2, Plus, PlayCircle, ChevronDown, ChevronUp, Loader2, Video, Edit3, X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  initialData: any[];
  courseId: string;
}

export default function ChaptersList({ initialData, courseId }: Props) {
  const [expandedChapters, setExpandedChapters] = useState<string[]>(initialData.map(ch => ch.id));
  const [isPending, startTransition] = useTransition();

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  // --- STATE KHUSUS UNTUK VIDEO UPLOAD & LIBRARY ---
  const [videoSource, setVideoSource] = useState<'upload' | 'library' | 'manual'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [libraryVideos, setLibraryVideos] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState("");

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]);
  };

  // --- FETCH VIDEO LIBRARY BUNNY ---
  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/bunny/library');
      const data = await res.json();
      if (data.items) setLibraryVideos(data.items);
    } catch (e) {
      toast.error("Gagal memuat library video");
    }
    setIsLoadingLibrary(false);
  };

  useEffect(() => {
    if (videoSource === 'library' && libraryVideos.length === 0) fetchLibrary();
  }, [videoSource]);

  // --- RESET STATE SAAT BUKA MODAL ---
  const openAddLesson = (chapterId: string) => {
    setAddingLessonTo(chapterId);
    setVideoSource('upload');
    setSelectedFile(null);
    setUploadProgress(0);
    setSelectedVideoId("");
  };

  const openEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setVideoSource(lesson.video_id ? 'library' : 'upload');
    setSelectedVideoId(lesson.video_id || "");
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // --- FUNGSI DIRECT UPLOAD KE BUNNY ---
  const processVideoUpload = async (title: string): Promise<string> => {
    if (videoSource === 'upload' && selectedFile) {
      setIsUploading(true);
      try {
        // 1. Minta Slot & Kredensial ke API Lokal
        const res = await fetch('/api/bunny/create', {
          method: 'POST',
          body: JSON.stringify({ title })
        });
        const { videoId: newId, libraryId, apiKey } = await res.json();
        
        // 2. Upload Langsung dari Browser (Bypass Server)
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          });
          xhr.addEventListener("load", () => resolve(newId));
          xhr.addEventListener("error", () => reject("Upload gagal"));
          
          xhr.open("PUT", `https://video.bunnycdn.com/library/${libraryId}/videos/${newId}`, true);
          xhr.setRequestHeader("AccessKey", apiKey);
          xhr.setRequestHeader("Content-Type", "application/octet-stream");
          xhr.send(selectedFile);
        });
        
        return newId;
      } catch (err) {
        throw err;
      } finally {
        setIsUploading(false);
      }
    }
    return selectedVideoId; // Kembalikan ID dari Library atau Manual
  };

  // --- ACTIONS ---
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
    if (!confirm("Yakin ingin menghapus bab ini beserta isinya?")) return;
    startTransition(async () => {
      await deleteChapter(chapterId, courseId);
      toast.success("Bab berhasil dihapus!");
    });
  };

  const handleAddLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingLessonTo) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    
    try {
      const finalVideoId = await processVideoUpload(title);
      
      formData.append("video_id", finalVideoId);
      formData.append("chapter_id", addingLessonTo);
      formData.append("course_id", courseId);

      startTransition(async () => {
        const result = await createLesson(formData);
        if (result.error) toast.error(result.error);
        else {
          toast.success("Materi berhasil ditambahkan!");
          setAddingLessonTo(null);
        }
      });
    } catch (e) {
      toast.error("Terjadi kesalahan saat mengupload video.");
    }
  };

  const handleEditLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLesson) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    
    try {
      const finalVideoId = await processVideoUpload(title);
      
      formData.append("video_id", finalVideoId);
      formData.append("course_id", courseId);

      startTransition(async () => {
        const result = await updateLesson(editingLesson.id, formData);
        if (result.error) toast.error(result.error);
        else {
          toast.success("Materi berhasil diperbarui!");
          setEditingLesson(null);
        }
      });
    } catch (e) {
      toast.error("Terjadi kesalahan saat mengupload video.");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;
    startTransition(async () => {
      await deleteLesson(lessonId, courseId);
      toast.success("Materi berhasil dihapus!");
    });
  };

  // --- KOMPONEN UI PILIHAN VIDEO (Digunakan di Add & Edit) ---
  const renderVideoSelector = () => (
    <div className="mb-4 space-y-2">
      <label className="block text-sm font-bold text-gray-700">Video Materi (Opsional)</label>
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button type="button" onClick={() => setVideoSource('upload')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${videoSource === 'upload' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500 hover:text-gray-700'}`}>Upload Lokal</button>
        <button type="button" onClick={() => setVideoSource('library')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${videoSource === 'library' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500 hover:text-gray-700'}`}>Pilih Library</button>
        <button type="button" onClick={() => setVideoSource('manual')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${videoSource === 'manual' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500 hover:text-gray-700'}`}>ID Manual</button>
      </div>

      {videoSource === 'upload' && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition relative overflow-hidden group">
           <input type="file" accept="video/*" disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
           {selectedFile ? (
             <div className="text-sm font-bold text-[#00C9A7] truncate px-4 flex flex-col items-center">
               <CheckCircle2 size={24} className="mb-1" />
               {selectedFile.name}
             </div>
           ) : (
             <div className="text-sm text-gray-500 flex flex-col items-center gap-1">
               <Video size={24} className="text-gray-300 mb-1 group-hover:text-[#00C9A7] transition"/> 
               Klik atau Drag video ke sini
             </div>
           )}
           {isUploading && (
             <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100">
               <div className="bg-[#00C9A7] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
             </div>
           )}
        </div>
      )}

      {videoSource === 'library' && (
        <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1 bg-gray-50">
           {isLoadingLibrary ? (
              <p className="text-xs text-center py-4 text-gray-500 flex justify-center items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Memuat video...</p>
           ) : libraryVideos.length === 0 ? (
              <p className="text-xs text-center py-4 text-gray-500">Belum ada video di Library.</p>
           ) : (
              libraryVideos.map(v => (
                <div key={v.guid} onClick={() => setSelectedVideoId(v.guid)} className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-3 transition ${selectedVideoId === v.guid ? 'border-[#00C9A7] bg-[#00C9A7]/10' : 'border-transparent hover:bg-gray-200/50 bg-white'}`}>
                  <div className={`w-10 h-8 rounded flex items-center justify-center shrink-0 transition ${selectedVideoId === v.guid ? 'bg-[#00C9A7] text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <Video size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-gray-700 truncate">{v.title}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{v.guid}</p>
                  </div>
                </div>
              ))
           )}
        </div>
      )}

      {videoSource === 'manual' && (
        <div>
          <input type="text" value={selectedVideoId} onChange={e => setSelectedVideoId(e.target.value)} placeholder="Contoh: d1bff247-cd78-..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm font-mono" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {initialData.map((chapter, index) => (
        <div key={chapter.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all">
          <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <button onClick={() => toggleChapter(chapter.id)} className="flex items-center gap-3 flex-1 text-left font-bold text-gray-800">
              {expandedChapters.includes(chapter.id) ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
              Bagian {index + 1}: {chapter.title}
            </button>
            <button onClick={() => handleDeleteChapter(chapter.id)} disabled={isPending} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              <Trash2 size={16} />
            </button>
          </div>

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
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditLesson(lesson)} disabled={isPending} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit Materi">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} disabled={isPending} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition" title="Hapus Materi">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <button onClick={() => openAddLesson(chapter.id)} className="flex items-center gap-2 text-sm font-bold text-[#00C9A7] hover:text-[#00b596] p-2 transition w-max mt-2">
                <Plus size={16} /> Tambah Materi Video
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Tambah Bab */}
      <div className="flex items-center gap-2 mt-6 bg-white p-4 rounded-xl border border-gray-200 border-dashed">
        <input type="text" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} placeholder="Nama Bab Baru (misal: Pengantar)" className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"/>
        <button onClick={handleAddChapter} disabled={isPending || !newChapterTitle.trim()} className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition">
          {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Tambah Bab"}
        </button>
      </div>

      {/* MODAL TAMBAH MATERI */}
      {addingLessonTo && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setAddingLessonTo(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Plus className="text-[#00C9A7]"/> Tambah Materi Baru</h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Materi</label>
                <input name="title" required type="text" placeholder="Contoh: Konsep Dasar" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm" />
              </div>
              
              {renderVideoSelector()}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea name="description" rows={3} placeholder="Materi ini membahas tentang..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setAddingLessonTo(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Batal</button>
                <button type="submit" disabled={isPending || isUploading} className="bg-[#00C9A7] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00b596] shadow-lg shadow-[#00C9A7]/20 transition disabled:opacity-50 flex items-center gap-2">
                  {(isPending || isUploading) ? <><Loader2 className="animate-spin w-4 h-4" /> Menyimpan...</> : "Simpan Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT MATERI */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setEditingLesson(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Edit3 className="text-blue-500"/> Edit Materi</h3>
            <form onSubmit={handleEditLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Materi</label>
                <input name="title" defaultValue={editingLesson.title} required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm" />
              </div>
              
              {renderVideoSelector()}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea name="description" defaultValue={editingLesson.description || ""} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingLesson(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Batal</button>
                <button type="submit" disabled={isPending || isUploading} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition disabled:opacity-50 flex items-center gap-2">
                  {(isPending || isUploading) ? <><Loader2 className="animate-spin w-4 h-4" /> Menyimpan...</> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}