"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { createChapter, deleteChapter } from "../actions";
import { createLesson, deleteLesson, updateLesson } from "../../lessons-actions";
import { Trash2, Plus, PlayCircle, ChevronDown, ChevronUp, Loader2, Video, Edit3, X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import BunnyVideoPlayer from "../../../components/BunnyVideoPlayer";

interface Props {
  initialData: any[];
  courseId: string;
}

export default function ChaptersList({ initialData, courseId }: Props) {
  const router = useRouter();
  const [expandedChapters, setExpandedChapters] = useState<string[]>(initialData.map(ch => ch.id));
  const [isPending, startTransition] = useTransition();

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

  const [videoSource, setVideoSource] = useState<'upload' | 'library' | 'manual'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const [libraryVideos, setLibraryVideos] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState("");

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]);
  };

  const toggleVideoPreview = (lessonId: string) => {
    setPreviewLessonId(prev => prev === lessonId ? null : lessonId);
  };

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/bunny/library');
      const data = await res.json();
      if (data.items) {
        setLibraryVideos(data.items);
      } else if (data.error) {
        toast.error(`Library: ${data.error}`);
      }
    } catch (e) {
      toast.error("Gagal memuat library video");
    }
    setIsLoadingLibrary(false);
  };

  useEffect(() => {
    if (videoSource === 'library' && libraryVideos.length === 0) fetchLibrary();
  }, [videoSource]);

  useEffect(() => {
    if (selectedFile && videoSource === 'upload') {
      const url = URL.createObjectURL(selectedFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [selectedFile, videoSource]);

  // --- FUNGSI MANAJEMEN BAB (CHAPTER) ---
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
        router.refresh(); 
      }
    });
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Yakin ingin menghapus bab ini beserta isinya?")) return;
    startTransition(async () => {
      await deleteChapter(chapterId, courseId);
      toast.success("Bab berhasil dihapus!");
      router.refresh(); 
    });
  };

  // --- FUNGSI MANAJEMEN MATERI (LESSON) ---
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

  const processVideoUpload = async (title: string): Promise<string> => {
    if (videoSource === 'upload' && selectedFile) {
      setIsUploading(true);
      try {
        const res = await fetch('/api/bunny/create', {
          method: 'POST',
          body: JSON.stringify({ title })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal inisiasi video di BunnyCDN");
        }

        const { videoId: newId, libraryId, apiKey } = await res.json();

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve(newId);
            else reject(new Error(`Upload ditolak server BunnyCDN (Status: ${xhr.status})`));
          });
          xhr.addEventListener("error", () => reject(new Error("Koneksi internet terputus saat upload")));

          xhr.open("PUT", `https://video.bunnycdn.com/library/${libraryId}/videos/${newId}`, true);
          xhr.setRequestHeader("AccessKey", apiKey);
          xhr.setRequestHeader("Content-Type", "application/octet-stream");
          xhr.send(selectedFile);
        });

        return newId;
      } catch (err: any) {
        throw err;
      } finally {
        setIsUploading(false);
      }
    }
    return selectedVideoId; 
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
          router.refresh(); 
        }
      });
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan saat mengupload video.");
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
          setPreviewLessonId(null); 
          router.refresh(); 
        }
      });
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan saat mengupload video.");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;
    startTransition(async () => {
      await deleteLesson(lessonId, courseId);
      toast.success("Materi berhasil dihapus!");
      router.refresh(); 
    });
  };

  // --- UI RENDER HELPERS ---
  const renderVideoSelector = () => (
    <div className="mb-4 space-y-3">
      <label className="block text-sm font-bold text-gray-700">Video Materi (Opsional)</label>
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button type="button" onClick={() => setVideoSource('upload')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${videoSource === 'upload' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500 hover:text-gray-700'}`}>Upload Lokal</button>
        <button type="button" onClick={() => setVideoSource('library')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${videoSource === 'library' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500 hover:text-gray-700'}`}>Pilih Library</button>
        <button type="button" onClick={() => setVideoSource('manual')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${videoSource === 'manual' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500 hover:text-gray-700'}`}>ID Manual</button>
      </div>

      {videoSource === 'upload' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition relative overflow-hidden group">
             <input type="file" accept="video/*" disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
             {selectedFile ? (
               <div className="text-sm font-bold text-[#00C9A7] truncate px-4 flex flex-col items-center">
                 <CheckCircle2 size={24} className="mb-1" />
                 File Terpilih: {selectedFile.name}
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
          {videoPreviewUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-black relative animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md z-10 font-bold tracking-wider">PREVIEW LOKAL</div>
              <video src={videoPreviewUrl} controls className="w-full max-h-[220px] object-contain">Browser Anda tidak mendukung tag video.</video>
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
        <input type="text" value={selectedVideoId} onChange={e => setSelectedVideoId(e.target.value)} placeholder="Contoh: d1bff247-cd78-..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm font-mono" />
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
                chapter.lessons.map((lesson: any, lIndex: number) => {
                  const isPreviewOpen = previewLessonId === lesson.id;
                  return (
                    <div key={lesson.id} className="flex flex-col p-4 bg-white border border-gray-100 rounded-xl hover:border-[#00C9A7]/30 transition group">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-start gap-3 flex-1">
                          <PlayCircle size={18} className="text-[#00C9A7] mt-0.5 shrink-0" />
                          <div className="flex-1 w-full">
                            <h4 className="font-bold text-gray-800 text-sm">{lIndex + 1}. {lesson.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lesson.description}</p>
                            {lesson.video_id && (
                              <div className="mt-3">
                                <button onClick={() => toggleVideoPreview(lesson.id)} className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors border ${isPreviewOpen ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}>
                                  {isPreviewOpen ? <ChevronUp size={12} /> : <PlayCircle size={12} />}
                                  {isPreviewOpen ? "Tutup Preview" : "Lihat Video"}
                                </button>
                              </div>
                            )}
                            {isPreviewOpen && lesson.video_id && (
                              <div className="mt-4 w-full md:w-3/4 aspect-video bg-black rounded-xl overflow-hidden border-2 border-gray-100 relative animate-in fade-in slide-in-from-top-2">
                                <BunnyVideoPlayer videoId={lesson.video_id} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                          <button onClick={() => openEditLesson(lesson)} disabled={isPending} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit Materi"><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} disabled={isPending} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition" title="Hapus Materi"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <button onClick={() => openAddLesson(chapter.id)} className="flex items-center gap-2 text-sm font-bold text-[#00C9A7] hover:text-[#00b596] p-2 transition w-max mt-2"><Plus size={16} /> Tambah Materi Video</button>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 mt-6 bg-white p-4 rounded-xl border border-gray-200 border-dashed">
        <input type="text" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} placeholder="Nama Bab Baru (misal: Pengantar)" className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"/>
        <button onClick={handleAddChapter} disabled={isPending || !newChapterTitle.trim()} className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition">
          {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Tambah Bab"}
        </button>
      </div>

      {addingLessonTo && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
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
              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white/90 backdrop-blur py-2">
                <button type="button" onClick={() => setAddingLessonTo(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Batal</button>
                <button type="submit" disabled={isPending || isUploading} className="bg-[#00C9A7] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00b596] shadow-lg shadow-[#00C9A7]/20 transition disabled:opacity-50 flex items-center gap-2">
                  {(isPending || isUploading) ? <><Loader2 className="animate-spin w-4 h-4" /> Menyimpan...</> : "Simpan Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
            <button onClick={() => {setEditingLesson(null); setPreviewLessonId(null);}} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
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
              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white/90 backdrop-blur py-2">
                <button type="button" onClick={() => {setEditingLesson(null); setPreviewLessonId(null);}} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Batal</button>
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