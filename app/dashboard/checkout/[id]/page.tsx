"use client";
export const runtime = 'nodejs';

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { enrollUser } from "../actions";
import { 
  Star, PlayCircle, Trophy, ArrowLeft, Target, ArrowRight, ChevronDown, 
  Loader2, FileCheck, Infinity, FileText, CheckCircle, Layers, Zap, Users
} from "lucide-react";
import toast from "react-hot-toast";

function getDurationText(duration: any) {
    if (!duration) return "Video";
    if (typeof duration === 'string') return duration; 
    if (typeof duration === 'number') {
        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration % 3600) / 60);
        if (h > 0) return `${h} j ${m} mnt`;
        return `${m} mnt`;
    }
    return "Video";
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const clientKey = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "").trim();
    const midtransScriptUrl = "https://app.midtrans.com/snap/snap.js";

    let scriptTag = document.querySelector(`script[src="${midtransScriptUrl}"]`);

    if (!scriptTag) {
      const script = document.createElement("script");
      script.src = midtransScriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true; 
      document.body.appendChild(script);
    }

    async function fetchData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const { data: courseData } = await supabase.from("courses").select("*").eq("id", courseId).single();
      
      if (courseData) {
        let subCat = null;
        let levelCat = null;
        if (courseData.sub_category_id) {
          const { data } = await supabase.from("sub_categories").select("name").eq("id", courseData.sub_category_id).single();
          subCat = data;
        }
        if (courseData.level_id) {
          const { data } = await supabase.from("course_levels").select("name").eq("id", courseData.level_id).single();
          levelCat = data;
        }
        courseData.sub_categories = subCat || null;
        courseData.course_levels = levelCat || null;

        setCourse(courseData);

        const { data: chaptersData } = await supabase.from("chapters").select("*").eq("course_id", courseId).order("position");
        setChapters(chaptersData || []);
        
        const chapterIds = chaptersData?.map(c => c.id) || [];
        if (chapterIds.length > 0) {
            const { data: lessonsData } = await supabase.from("lessons").select("*").in("chapter_id", chapterIds).order("position");
            setLessons(lessonsData || []);
        }
      }
      setLoading(false);
    }
    
    fetchData();
  }, [courseId, supabase]);

  const handlePayment = async () => {
    if (!(window as any).snap) {
      toast.error("Sistem pembayaran sedang dimuat. Mohon tunggu beberapa detik lalu coba lagi.");
      return;
    }

    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return router.push(`/login?redirect=/dashboard/checkout/${courseId}`);
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          price: course.price,
          title: course.title,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || "Siswa Klas",
        }),
      });

      const { token, error } = await response.json();

      if (error) {
        toast.error("Gagal memulai transaksi: " + error);
        setIsProcessing(false);
        return;
      }

      (window as any).snap.pay(token, {
        onSuccess: async function(result: any) {
          toast.success("Pembayaran Berhasil!");
          const res = await enrollUser(course.id, course.price);
          if (res?.error) {
            toast.error("Gagal mendaftarkan kelas: " + res.error);
            setIsProcessing(false);
            return;
          }
          window.location.href = "/dashboard";
        },
        onPending: function() { toast("Menunggu Pembayaran..."); },
        onError: function() { toast.error("Pembayaran Gagal"); setIsProcessing(false); },
        onClose: function() { setIsProcessing(false); }
      });
    } catch (err) {
      toast.error("Gagal memproses transaksi");
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-[#00C9A7]">
        <Loader2 className="animate-spin" size={40} />
    </div>
  );

  const safePrice = Number(course?.price || 0);
  const safeStrikePrice = Number(course?.strike_price || 0);
  const discountPercent = (safeStrikePrice > safePrice) 
    ? Math.round(((safeStrikePrice - safePrice) / safeStrikePrice) * 100) 
    : 0;

  // LOGIKA RATING ASLI/DUMMY UNTUK CHECKOUT DARI DATABASE
  const isDummy = course?.use_dummy_rating ?? true;
  const displayRating = isDummy ? Number(course?.dummy_rating || 5.0) : Number(course?.rating || 0);
  const displayReviews = isDummy ? Number(course?.dummy_rating_count || 5) : Number(course?.review_count || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#F97316] selection:text-white flex flex-col">
      <div className="bg-gray-950 text-white pt-8 pb-24 px-4 md:px-8 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src="/logo.png" alt="pattern" fill className="object-cover scale-150 grayscale" />
         </div>
         
         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
               <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#00C9A7] transition-colors mb-10 bg-gray-800 px-4 py-2 rounded-lg w-max">
                 <ArrowLeft size={16} /> Kembali ke Jelajah
               </Link>
               
               <div className="flex items-center gap-3 mb-5">
                 <span className="bg-[#00C9A7]/20 text-[#00C9A7] px-4 py-1.5 rounded-full text-xs font-bold border border-[#00C9A7]/30 tracking-wide uppercase">
                   {course?.sub_categories?.name || "Kategori Umum"}
                 </span>
                 <span className="bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-500/30">
                   {course?.course_levels?.name || course?.difficulty || "Semua Level"}
                 </span>
               </div>
               
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight text-white">{course?.title}</h1>
               <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-3xl leading-relaxed font-medium">{course?.description}</p>
               
               <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-base text-gray-300 border-t border-gray-800 pt-8 mt-8">
                  <span className="flex items-center gap-2 font-semibold"><Star size={20} className="text-yellow-400 fill-yellow-400"/> {displayRating.toFixed(1)} Rating Kelas ({displayReviews} Ulasan)</span>
                  <span className="flex items-center gap-2 font-semibold"><Layers size={20} className="text-[#00C9A7]"/> {course?.course_levels?.name || course?.difficulty || "All Level"}</span>
                  <span className="flex items-center gap-2 font-semibold"><Users size={20} className="text-[#00C9A7]"/> {course?.sales_count || 0} Siswa Terdaftar</span>
               </div>
            </div>
         </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 w-full pb-24">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative">
            <div className="lg:col-span-2 space-y-12 -mt-10 lg:-mt-16 relative z-20">
               <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 space-y-10">
                  {course?.goals && (
                     <div>
                        <h2 className="text-2xl font-black text-gray-950 mb-5 flex items-center gap-3">
                           <Target className="text-[#F97316]" size={28}/> Your Goal
                        </h2>
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl text-gray-800 font-semibold leading-relaxed shadow-sm">
                           <p>{course.goals}</p>
                        </div>
                     </div>
                  )}

                  <div>
                     <h2 className="text-2xl font-black text-gray-950 mb-6 flex items-center gap-3">
                        <Zap className="text-[#00C9A7]" size={28}/> Key Points
                     </h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {(() => {
                           let keypoints = [];
                           try { 
                             if (typeof course?.keypoints === 'string') { keypoints = JSON.parse(course.keypoints); } 
                             else if (Array.isArray(course?.keypoints)) { keypoints = course.keypoints; }
                           } catch(e) {}
                           
                           if (!keypoints || keypoints.length === 0) return <p className="text-gray-500 col-span-2 italic">Key points sedang dalam proses update.</p>;

                           return keypoints.map((pt: string, i: number) => (
                              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#00C9A7]/30 hover:bg-[#00C9A7]/5 transition-colors group">
                                 <CheckCircle size={22} className="text-[#00C9A7] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                                 <span className="text-gray-700 text-sm font-semibold leading-relaxed">{pt}</span>
                              </div>
                           ));
                        })()}
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="flex items-center justify-between gap-4">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-950">Kurikulum & Silabus</h2>
                        <span className="text-sm font-bold text-[#F97316] bg-orange-100 px-4 py-2 rounded-full">{chapters?.length || 0} Bab</span>
                     </div>
                     
                     <div className="space-y-5">
                        {(!chapters || chapters.length === 0) && <p className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">Silabus belum tersedia.</p>}
                        {chapters?.map((chapter: any, idx: number) => (
                           <details key={chapter.id} className="group bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden hover:border-[#00C9A7]/30 transition-all" open={idx === 0}>
                              <summary className="p-6 bg-gray-50 flex items-center justify-between cursor-pointer list-none outline-none">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border border-gray-200 group-hover:bg-[#00C9A7] group-hover:text-white group-hover:border-[#00C9A7] text-gray-600 rounded-xl flex items-center justify-center font-bold transition-colors">{idx + 1}</div>
                                    <span className="font-extrabold text-gray-800 text-lg">Bab {idx + 1}: {chapter.title}</span>
                                 </div>
                                 <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-[#00C9A7]" />
                              </summary>
                              <div className="p-4 space-y-2 border-t border-gray-100">
                                 {lessons.filter(l => l.chapter_id === chapter.id).sort((a:any, b:any) => a.position - b.position).map((lesson: any, lIdx: number) => (
                                    <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition group/lesson">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${lesson.is_preview ? 'bg-[#00C9A7]/10 text-[#00C9A7]' : 'bg-gray-100 text-gray-400 group-hover/lesson:bg-gray-200'}`}>
                                          <PlayCircle size={20} />
                                       </div>
                                       <div className="flex-1 flex justify-between items-center">
                                          <div>
                                             <h4 className={`text-sm ${lesson.is_preview ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>{lIdx + 1}. {lesson.title}</h4>
                                             <span className="text-xs text-gray-400 font-bold">{getDurationText(lesson.duration)}</span>
                                          </div>
                                          {lesson.is_preview && <span className="text-[10px] bg-teal-50 text-[#00C9A7] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-inner shadow-teal-100">Preview</span>}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </details>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-28 lg:self-start -mt-20 lg:-mt-64 relative z-30">
               <div className="bg-white text-gray-950 rounded-3xl p-7 shadow-2xl shadow-gray-200/70 border border-gray-100">
                  <div className="aspect-video bg-gray-100 rounded-2xl mb-7 relative overflow-hidden border border-gray-100 group shadow-inner">
                    {course?.thumbnail_url ? (
                      <Image src={course.thumbnail_url} alt="Cover" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 gap-2">
                         <Image src="/logo.png" alt="logo" width={50} height={50} className="grayscale opacity-20" />
                         <PlayCircle size={40} className="opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <PlayCircle size={60} className="text-white opacity-80" />
                    </div>
                  </div>
                  
                  <div className="mb-6 flex flex-col">
                     {safePrice > 0 ? (
                        <>
                           <h2 className="text-4xl font-black text-gray-900 tracking-tight">Rp {safePrice.toLocaleString("id-ID")}</h2>
                           {safeStrikePrice > 0 && (
                              <div className="flex items-center gap-3 mt-2">
                                 <span className="text-base text-gray-400 line-through font-bold">Rp {safeStrikePrice.toLocaleString("id-ID")}</span>
                                 <span className="bg-orange-100 text-[#F97316] text-xs font-black px-2 py-1 rounded-md uppercase tracking-wide border border-orange-200">Diskon {discountPercent}%</span>
                              </div>
                           )}
                        </>
                     ) : (
                        <h2 className="text-4xl font-black text-[#00C9A7] tracking-tight">GRATIS</h2>
                     )}
                  </div>
                  
                  <button 
                     onClick={handlePayment}
                     disabled={isProcessing}
                     className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-4.5 font-black text-lg rounded-2xl transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     {isProcessing ? <Loader2 className="animate-spin" /> : <>Beli Kelas Sekarang <ArrowRight size={20} /></>}
                  </button>
                  
                  <p className="text-center text-xs text-gray-400 px-4 mt-4 font-medium">Jaminan 100% materi sesuai kurikulum.</p>

                  <div className="border-t border-gray-100 pt-6 mt-6">
                     <h4 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider">Fasilitas Eksklusif:</h4>
                     <ul className="space-y-4 text-sm text-gray-700 font-medium">
                        <li className="flex items-start gap-3"><div className="mt-0.5 text-[#00C9A7]"><PlayCircle size={18} /></div> Akses Video Selamanya</li>
                        <li className="flex items-start gap-3"><div className="mt-0.5 text-[#00C9A7]"><FileCheck size={18} /></div> Tugas Terstruktur</li>
                        <li className="flex items-start gap-3"><div className="mt-0.5 text-[#00C9A7]"><Infinity size={18} /></div> Akses Penuh Seumur Hidup</li>
                        <li className="flex items-start gap-3"><div className="mt-0.5 text-[#00C9A7]"><FileText size={18} /></div> Modul & Teks Keterangan</li>
                        <li className="flex items-start gap-3"><div className="mt-0.5 text-[#00C9A7]"><Trophy size={18} /></div> Sertifikat Penyelesaian</li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}