"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Video, Edit2, X, Loader2, UploadCloud, Film, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { deleteLesson, saveLesson, getBunnyVideos, uploadVideoToBunny } from "@/app/dashboard/courses/actions"; 

export default function LessonManager({
  chapterId,
  initialLessons,
}: {
  chapterId: string;
  initialLessons: any[];
}) {
  // --- STATE MANAGEMENT ---
  const [lessons, setLessons] = useState(initialLessons);
  const [isEditing, setIsEditing] = useState<string | null>(null); 
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // State Sumber Video
  const [videoSource, setVideoSource] = useState<'upload' | 'library'>('upload');
  
  // State Library
  const [libraryVideos, setLibraryVideos] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    video_id: "",
    description: ""
  });

  // --- PERBAIKAN UTAMA DI SINI ---
  // Kita simpan FILE ASLI di state, bukan cuma namanya
  const [videoFile, setVideoFile] = useState<File | null>(null); 
  const [selectedFileName, setSelectedFileName] = useState<string>(""); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNCTIONS ---

  // 1. Reset Form
  const resetForm = () => {
    setFormData({ title: "", video_id: "", description: "" });
    setIsEditing(null);
    setIsCreating(false);
    setVideoSource('upload');
    setIsProcessing(false);
    
    // Reset File
    setSelectedFileName("");
    setVideoFile(null); // Kosongkan memori file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 2. Load Library
  useEffect(() => {
    if (videoSource === 'library' && libraryVideos.length === 0) {
        loadLibrary();
    }
  }, [videoSource]);

  const loadLibrary = async () => {
    setIsLoadingLibrary(true);
    const res = await getBunnyVideos();
    if (res?.items) setLibraryVideos(res.items);
    setIsLoadingLibrary(false);
  }

  // 3. Handle Klik Edit
  const handleEditClick = (lesson: any) => {
    setFormData({
      title: lesson.title,
      video_id: lesson.video_id,
      description: lesson.description || ""
    });
    setIsEditing(lesson.id);
    setIsCreating(false);
    setSelectedFileName("");
    setVideoFile(null);
  };

  // 4. Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus materi ini?")) return;
    const dataToSend = new FormData(); 
    dataToSend.append("id", id);
    try {
        await deleteLesson(dataToSend);
        toast.success("Materi dihapus.");
        window.location.reload();
    } catch (e) {
        toast.error("Gagal menghapus.");
    }
  };

  // 5. HANDLE SIMPAN & UPLOAD (CORE LOGIC)
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.title) {
        toast.error("Judul materi wajib diisi!");
        return;
    }

    setIsProcessing(true);
    
    try {
        let finalVideoId = formData.video_id;

        // === LOGIKA UPLOAD ===
        if (videoSource === 'upload') {
            
            // A. Cek apakah ada file di MEMORI STATE (videoFile)
            if (videoFile) {
                const loadingToast = toast.loading("Sedang mengupload video ke Bunny.net... (Jangan tutup)", { id: "uploading" });

                const uploadData = new FormData();
                uploadData.append("file", videoFile); // Kirim file dari State
                uploadData.append("title", formData.title);

                // Panggil Server Action
                const uploadRes = await uploadVideoToBunny(uploadData);
                
                toast.dismiss(loadingToast);

                if (uploadRes?.error) throw new Error(uploadRes.error);
                
                finalVideoId = uploadRes.videoId;
                toast.success("Upload Video Sukses!");
            } 
            // B. Jika tidak ada file baru & mode tambah baru -> Error
            else if (!finalVideoId && !isEditing) {
                throw new Error("Silakan pilih file video terlebih dahulu!");
            }
        } 
        // === LOGIKA LIBRARY ===
        else {
            if (!finalVideoId) throw new Error("Pilih video dari library!");
        }

        // === SIMPAN KE DATABASE ===
        toast.loading("Menyimpan ke database...", { id: "saving" });
        
        const serverData = new FormData();
        serverData.append("chapter_id", chapterId);
        serverData.append("title", formData.title);
        serverData.append("video_id", finalVideoId);
        serverData.append("description", formData.description);
        if (isEditing) serverData.append("id", isEditing);

        const res = await saveLesson(serverData);
        toast.dismiss("saving");
        
        if (res?.error) throw new Error(res.error);

        toast.success("Berhasil disimpan!");
        window.location.reload(); 

    } catch (error: any) {
        toast.dismiss(); 
        toast.error(error.message || "Gagal menyimpan.");
        setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* LIST MATERI */}
      <div className="space-y-3 mb-6">
        {lessons?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((lesson: any, idx: number) => (
          <div key={lesson.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{idx + 1}</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{lesson.title}</p>
                <p className="text-xs text-gray-400 font-mono flex items-center gap-1"><Video size={10} /> {lesson.video_id}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditClick(lesson)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(lesson.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {lessons.length === 0 && !isCreating && <p className="text-gray-400 text-sm italic text-center py-4">Belum ada video materi.</p>}
      </div>

      {/* FORM INPUT */}
      {isCreating || isEditing ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-gray-800">{isEditing ? "Edit Materi" : "Tambah Materi Baru"}</h4>
            <button type="button" onClick={resetForm} disabled={isProcessing}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Judul Materi</label>
                <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Pengenalan Tools" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none" required disabled={isProcessing} />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Sumber Video</label>
                <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                    <button type="button" onClick={() => setVideoSource('upload')} disabled={isProcessing} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${videoSource === 'upload' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500'}`}><UploadCloud size={16} /> Upload File</button>
                    <button type="button" onClick={() => setVideoSource('library')} disabled={isProcessing} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${videoSource === 'library' ? 'bg-white shadow text-[#00C9A7]' : 'text-gray-500'}`}><Film size={16} /> Pilih dari Library</button>
                </div>

                {videoSource === 'upload' && (
                    <div 
                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 relative group hover:border-[#00C9A7] transition cursor-pointer"
                        onClick={() => !isProcessing && fileInputRef.current?.click()}
                    >
                        {isProcessing ? (
                            <div className="py-4 flex flex-col items-center">
                                <Loader2 className="animate-spin text-[#00C9A7] w-8 h-8 mb-2" />
                                <span className="text-xs font-bold text-gray-500">Sedang memproses...</span>
                            </div>
                        ) : (
                            <>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="video/mp4,video/x-m4v,video/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if(file) {
                                            // SIMPAN KE STATE
                                            setVideoFile(file); 
                                            setSelectedFileName(file.name);
                                            toast.success("File siap diupload!");
                                        }
                                    }}
                                />
                                
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#00C9A7] group-hover:scale-110 transition">
                                        <UploadCloud size={24} />
                                    </div>
                                    
                                    {selectedFileName ? (
                                        <span className="text-sm font-bold text-[#00C9A7]">{selectedFileName}</span>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-600">Klik area ini untuk pilih video</span>
                                    )}
                                    
                                    <span className="text-xs text-gray-400">MP4, MKV (Max 1GB)</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {videoSource === 'library' && (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 max-h-60 overflow-y-auto">
                        {isLoadingLibrary ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400"/></div> : (
                            <div className="grid grid-cols-1 gap-2">
                                {libraryVideos.map((vid) => (
                                    <div key={vid.guid} onClick={() => !isProcessing && setFormData({...formData, video_id: vid.guid})} className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between hover:bg-white transition ${formData.video_id === vid.guid ? 'border-[#00C9A7] bg-green-50' : 'border-gray-100 bg-white'}`}>
                                        <div className="truncate"><p className="text-sm font-bold text-gray-800 truncate">{vid.title}</p></div>
                                        {formData.video_id === vid.guid && <CheckCircle className="text-[#00C9A7]" size={18} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Deskripsi</label>
                 <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm" rows={2} disabled={isProcessing} />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={resetForm} disabled={isProcessing} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={isProcessing} className={`flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 ${isProcessing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-[#00C9A7] text-white hover:bg-[#00b894]'}`}>
                {isProcessing && <Loader2 className="animate-spin w-4 h-4" />} 
                {isProcessing ? "Memproses..." : "Simpan & Upload"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={() => setIsCreating(true)} className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 font-bold rounded-2xl hover:border-[#00C9A7] hover:text-[#00C9A7] hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm"><Plus size={18} /> Tambah Video</button>
      )}
    </div>
  );
}