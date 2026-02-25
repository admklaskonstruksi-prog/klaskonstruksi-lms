"use client";

import { useState, useEffect } from "react";
import { PlayCircle, CheckCircle, ChevronDown, ChevronRight, BookOpen, Star, ArrowRight } from "lucide-react";
import BunnyVideoPlayer from "@/app/dashboard/components/BunnyVideoPlayer"; 
import Link from "next/link";
import Image from "next/image";

interface CoursePlayerProps {
  course: any;
  chapters: any[];
  relatedCourses?: any[];
}

export default function CoursePlayer({ course, chapters, relatedCourses = [] }: CoursePlayerProps) {
  
  // LOGIKA PINTAR: Cari video pertama, entah itu di dalam tabel "lessons" atau langsung di "chapters"
  let initialLesson = null;
  for (const chapter of chapters) {
      if (chapter.lessons && chapter.lessons.length > 0) {
          initialLesson = chapter.lessons[0];
          break;
      } else if (chapter.video_id) {
          initialLesson = chapter;
          break;
      }
  }
  
  const [activeLesson, setActiveLesson] = useState<any>(initialLesson);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(
    chapters.reduce((acc, chapter) => ({ ...acc, [chapter.id]: true }), {})
  );

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  useEffect(() => {
    if (!activeLesson && initialLesson) {
        setActiveLesson(initialLesson);
    }
  }, [initialLesson, activeLesson]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* AREA KIRI: VIDEO PLAYER */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="lg:hidden p-4 bg-white border-b flex items-center gap-2">
            <Link href="/dashboard/my-courses" className="text-sm font-medium text-gray-500 hover:text-black">
                ← Kembali
            </Link>
            <span className="font-bold truncate">{course.title}</span>
        </div>

        {/* KOMPONEN PEMUTAR VIDEO */}
        <div className="bg-black w-full aspect-video relative flex items-center justify-center group border-b border-gray-800 shadow-xl">
            {activeLesson?.video_id ? (
                <BunnyVideoPlayer 
                    key={activeLesson.video_id} 
                    videoId={activeLesson.video_id} 
                    title={activeLesson.title} 
                />
            ) : (
                <div className="text-center text-gray-500 flex flex-col items-center p-6">
                    <PlayCircle size={48} className="mb-4 opacity-50" />
                    <p className="mb-1 font-bold text-white">Video belum tersedia</p>
                    <p className="text-xs">ID Video tidak ditemukan pada database untuk materi ini.</p>
                </div>
            )}
        </div>

        <div className="p-6 md:p-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-gray-200 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {activeLesson ? activeLesson.title : "Pilih Materi"}
                    </h1>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                       <BookOpen size={14}/> {course.title}
                    </p>
                    {activeLesson?.description && (
                        <p className="text-gray-600 mt-4 text-sm leading-relaxed max-w-3xl">
                            {activeLesson.description}
                        </p>
                    )}
                </div>
                
                <button className="bg-[#00C9A7] hover:bg-[#00b596] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#00C9A7]/20 transition-all active:scale-95 shrink-0 whitespace-nowrap">
                    <CheckCircle size={20} /> Tandai Selesai
                </button>
            </div>

            {relatedCourses && relatedCourses.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="text-yellow-400 fill-yellow-400" />
                        <h3 className="text-lg font-bold text-gray-900">Rekomendasi Kelas Serupa</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedCourses.map((relCourse: any) => (
                            <Link href={`/dashboard/checkout/${relCourse.id}`} key={relCourse.id} className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="aspect-video relative bg-gray-100">
                                    {relCourse.thumbnail_url && <Image src={relCourse.thumbnail_url} alt={relCourse.title} fill className="object-cover" />}
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-[#00C9A7] mb-2">{relCourse.title}</h4>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="font-bold text-gray-900">{relCourse.price === 0 ? "Gratis" : `Rp ${relCourse.price.toLocaleString("id-ID")}`}</span>
                                        <span className="flex items-center gap-1">Detail <ArrowRight size={10}/></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* AREA KANAN: DAFTAR MATERI (PLAYLIST) */}
      <div className="w-full lg:w-[400px] bg-white border-l border-gray-200 h-auto lg:h-full overflow-y-auto flex-shrink-0 shadow-xl z-20">
        <div className="p-5 border-b border-gray-100 bg-gray-50 sticky top-0 z-10 flex items-center justify-between">
            <div>
                <h2 className="font-bold text-gray-900 text-lg">Daftar Materi</h2>
                <p className="text-xs text-gray-500 mt-1">{chapters.length} Bab Pembelajaran</p>
            </div>
            <Link href="/dashboard/my-courses" className="hidden lg:flex text-xs font-bold text-gray-500 hover:text-[#00C9A7] hover:border-[#00C9A7] transition border border-gray-200 px-3 py-1.5 rounded-lg bg-white shadow-sm">
                Tutup Kelas
            </Link>
        </div>

        <div className="divide-y divide-gray-100 pb-20">
            {chapters.length === 0 && (
                <div className="p-10 text-center flex flex-col items-center justify-center h-64 text-gray-400">
                    <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Belum ada kurikulum.</p>
                </div>
            )}

            {chapters.map((chapter: any, index: number) => (
                <div key={chapter.id} className="bg-white">
                    <button 
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-teal-50/50 transition text-left outline-none"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[#00C9A7] bg-teal-50 w-7 h-7 flex items-center justify-center rounded-lg">
                                {index + 1}
                            </span>
                            <div>
                                <span className="text-sm font-bold text-gray-800 line-clamp-1 pr-2">{chapter.title}</span>
                                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                                    {chapter.lessons?.length > 0 ? `${chapter.lessons.length} Materi` : (chapter.video_id ? "1 Materi (Video Bab)" : "Kosong")}
                                </span>
                            </div>
                        </div>
                        {expandedChapters[chapter.id] ? <ChevronDown size={16} className="text-gray-400 shrink-0"/> : <ChevronRight size={16} className="text-gray-400 shrink-0"/>}
                    </button>

                    {expandedChapters[chapter.id] && (
                        <div className="bg-gray-50/80 border-t border-gray-100">
                            {chapter.lessons?.length > 0 ? (
                                chapter.lessons.map((lesson: any, lessonIdx: number) => {
                                    const isActive = activeLesson?.id === lesson.id;
                                    return (
                                        <button 
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className={`w-full flex items-start gap-3 p-4 text-left transition ${isActive ? "bg-white border-l-4 border-[#00C9A7] shadow-sm" : "border-l-4 border-transparent hover:bg-gray-100"}`}
                                        >
                                            <PlayCircle size={16} className={`mt-0.5 shrink-0 ${isActive ? "text-[#00C9A7] fill-teal-50" : "text-gray-300"}`} />
                                            <div>
                                                <p className={`text-xs ${isActive ? "text-gray-900 font-bold" : "text-gray-600 font-medium"}`}>
                                                    {lessonIdx + 1}. {lesson.title}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-bold">
                                                    {lesson.video_id ? "Video" : "Teks"} {isActive && <span className="text-[#00C9A7] ml-1 font-black">• Sedang Diputar</span>}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : chapter.video_id ? (
                                <button 
                                    onClick={() => setActiveLesson(chapter)}
                                    className={`w-full flex items-start gap-3 p-4 text-left transition ${activeLesson?.id === chapter.id ? "bg-white border-l-4 border-[#00C9A7] shadow-sm" : "border-l-4 border-transparent hover:bg-gray-100"}`}
                                >
                                    <PlayCircle size={16} className={`mt-0.5 shrink-0 ${activeLesson?.id === chapter.id ? "text-[#00C9A7] fill-teal-50" : "text-gray-300"}`} />
                                    <div>
                                        <p className={`text-xs ${activeLesson?.id === chapter.id ? "text-gray-900 font-bold" : "text-gray-600 font-medium"}`}>
                                            Video Pembelajaran
                                        </p>
                                        <p className="text-[10px] text-[#00C9A7] mt-1 font-bold">Siap Diputar</p>
                                    </div>
                                </button>
                            ) : (
                                <p className="text-[11px] text-gray-400 p-4 text-center font-medium">Bab ini belum memiliki materi/video.</p>
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