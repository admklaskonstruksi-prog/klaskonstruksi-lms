"use client";

import { useState } from "react";
import { PlayCircle, CheckCircle, Lock, ChevronDown, ChevronRight, Menu } from "lucide-react";
import BunnyVideoPlayer from "@/app/dashboard/components/BunnyVideoPlayer"; 

interface CoursePlayerProps {
  course: any;
  chapters: any[];
}

export default function CoursePlayer({ course, chapters }: CoursePlayerProps) {
  // State untuk materi yang sedang aktif (Default: Materi pertama dari Bab pertama)
  // Kita cari materi pertama yang ada
  const firstLesson = chapters.find(c => c.lessons.length > 0)?.lessons[0];
  
  const [activeLesson, setActiveLesson] = useState<any>(firstLesson || null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(
    // Default semua bab terbuka
    chapters.reduce((acc, chapter) => ({ ...acc, [chapter.id]: true }), {})
  );

  // Toggle Buka/Tutup Bab
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
      
      {/* --- AREA KIRI: VIDEO PLAYER --- */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
          {activeLesson ? (
            <BunnyVideoPlayer 
              videoId={activeLesson.video_id} 
              title={activeLesson.title} 
            />
          ) : (
            <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-500">
              <p>Belum ada materi yang tersedia.</p>
            </div>
          )}
        </div>

        {/* Judul & Deskripsi Materi Aktif */}
        <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-200">
           <h1 className="text-2xl font-bold text-gray-800 mb-2">
             {activeLesson?.title || course.title}
           </h1>
           <p className="text-gray-500 leading-relaxed">
             {activeLesson?.description || "Tidak ada deskripsi untuk materi ini."}
           </p>

           {/* Tombol Aksi (Nanti bisa ditambah fungsi Mark as Complete) */}
           <div className="mt-6 flex gap-3">
              <button className="px-6 py-2.5 bg-[#00C9A7] text-white font-bold rounded-xl hover:bg-[#00b894] transition flex items-center gap-2">
                 <CheckCircle size={18} /> Tandai Selesai
              </button>
           </div>
        </div>
      </div>

      {/* --- AREA KANAN: DAFTAR MATERI (PLAYLIST) --- */}
      <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm">
         <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Daftar Materi</h3>
            <p className="text-xs text-gray-400 mt-1">{course.title}</p>
         </div>
         
         <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chapters.map((chapter, index) => (
               <div key={chapter.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Header Bab */}
                  <button 
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                  >
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5 h-5 flex items-center justify-center border border-gray-200 rounded bg-white">
                            {index + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-700 line-clamp-1">{chapter.title}</span>
                     </div>
                     {expandedChapters[chapter.id] ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                  </button>

                  {/* List Lesson dalam Bab */}
                  {expandedChapters[chapter.id] && (
                     <div className="bg-white">
                        {chapter.lessons.length > 0 ? (
                            chapter.lessons.map((lesson: any) => (
                                <button 
                                    key={lesson.id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`w-full flex items-start gap-3 p-3 text-left transition hover:bg-green-50 ${
                                        activeLesson?.id === lesson.id 
                                        ? "bg-green-50 border-l-4 border-[#00C9A7]" 
                                        : "border-l-4 border-transparent"
                                    }`}
                                >
                                    {/* Icon Status (Nanti bisa diganti CheckCircle jika sudah selesai) */}
                                    <PlayCircle 
                                        size={16} 
                                        className={`mt-0.5 shrink-0 ${activeLesson?.id === lesson.id ? "text-[#00C9A7] fill-green-100" : "text-gray-400"}`} 
                                    />
                                    
                                    <div>
                                        <p className={`text-xs font-medium ${activeLesson?.id === lesson.id ? "text-[#00C9A7] font-bold" : "text-gray-600"}`}>
                                            {lesson.title}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                            Video • {lesson.video_id ? "Siap" : "Proses"}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-[10px] text-gray-400 italic p-3 text-center">Belum ada materi.</p>
                        )}
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}