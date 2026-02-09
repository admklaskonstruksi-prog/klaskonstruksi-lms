"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, PlayCircle, List, Loader2 } from "lucide-react";
import { completeMission, updateLessonProgress } from "../../actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function MissionTerminal({ chapter, lessons }: { chapter: any, lessons: any[] }) {
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState(lessons[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [watchedLessons, setWatchedLessons] = useState<Set<string>>(new Set());

  // LIBRARY ID BUNNY.NET (Ganti dengan ID Anda)
  const BUNNY_LIBRARY_ID = '299616'; 

  // Logic Tracking Progress
  useEffect(() => {
    if (activeLesson && lessons.length > 0) {
      const newWatched = new Set(watchedLessons).add(activeLesson.id);
      setWatchedLessons(newWatched);
      
      const progressPercent = Math.round((newWatched.size / lessons.length) * 100);
      updateLessonProgress(chapter.id, progressPercent);
    }
  }, [activeLesson]);

  const isAllWatched = lessons.length > 0 && watchedLessons.size === lessons.length;

  const handleComplete = async () => {
    if (!isAllWatched) return;
    setIsSubmitting(true);
    const result = await completeMission(chapter.id);
    
    if (result.success) {
      toast.success("Selamat! Modul terselesaikan.");
      router.push("/dashboard/learning-path");
    } else {
      toast.error("Gagal update status: " + result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      
      {/* --- HEADER NAVIGASI --- */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
         <Link href="/dashboard/learning-path" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition shadow-sm">
            <ArrowLeft size={18} />
         </Link>
         <div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-green-50 text-[#00C9A7] px-2 py-0.5 rounded uppercase tracking-wide">
                  Modul Pembelajaran
                </span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">{chapter.title}</h1>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">
        
        {/* --- KIRI: VIDEO PLAYER --- */}
        <div className="flex-1 flex flex-col min-h-0">
           {/* Frame Video */}
           <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              {activeLesson ? (
                <iframe 
                  src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${activeLesson.video_id}?autoplay=false`} 
                  loading="lazy"
                  className="w-full h-full border-none"
                  allowFullScreen={true}
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                   <PlayCircle size={48} className="mb-2 opacity-50" />
                   <p className="text-sm font-medium">Video tidak ditemukan</p>
                </div>
              )}
           </div>

           {/* Judul & Deskripsi Video */}
           <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{activeLesson?.title || "Memuat..."}</h2>
              <p className="text-gray-500 text-sm leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                {activeLesson?.description || "Tidak ada deskripsi untuk materi ini."}
              </p>
           </div>
        </div>

        {/* --- KANAN: PLAYLIST MATERI --- */}
        <div className="w-full lg:w-96 flex flex-col h-full bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <List className="text-gray-500" size={18} />
              <h3 className="font-bold text-gray-800 text-sm">Daftar Materi ({watchedLessons.size}/{lessons.length})</h3>
           </div>

           <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {lessons.map((lesson, idx) => {
                const isActive = activeLesson?.id === lesson.id;
                const isWatched = watchedLessons.has(lesson.id);
                return (
                  <button 
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex gap-3 ${
                      isActive 
                        ? 'bg-[#00C9A7]/10 border border-[#00C9A7]/20' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                       isWatched ? 'bg-green-500 text-white' : (isActive ? 'bg-[#00C9A7] text-white' : 'bg-gray-200 text-gray-500')
                    }`}>
                       {isWatched ? <CheckCircle size={12} /> : idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold leading-tight ${isActive ? 'text-[#00C9A7]' : 'text-gray-700'}`}>
                        {lesson.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">Video Pembelajaran</p>
                    </div>
                  </button>
                );
              })}
           </div>

           {/* Tombol Selesai */}
           <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={handleComplete}
                disabled={!isAllWatched || isSubmitting}
                className={`w-full py-3.5 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm ${
                  isAllWatched 
                    ? 'bg-[#00C9A7] hover:bg-[#00b894] text-white shadow-lg shadow-green-200 cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    <CheckCircle size={18} /> 
                    {isAllWatched ? "Tandai Selesai" : "Selesaikan Semua Materi"}
                  </>
                )}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}