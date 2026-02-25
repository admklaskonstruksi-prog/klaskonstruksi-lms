"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Star, 
  StarHalf, 
  PlayCircle, 
  Trophy, 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  Target, 
  ArrowRight, 
  ChevronDown, 
  Users, 
  Loader2,
  FileCheck,     // Ikon untuk Tugas
  Infinity,      // Ikon untuk Akses Seumur Hidup
  FileText       // Ikon untuk Teks Keterangan
} from "lucide-react";
import toast from "react-hot-toast";

// --- KOMPONEN BINTANG DINAMIS (Perbaikan visual) ---
const RenderStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5 text-[#f69c08]">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={16} fill="currentColor" stroke="currentColor" strokeWidth={1} />
      ))}
      {hasHalfStar && <StarHalf key="half" size={16} fill="currentColor" stroke="currentColor" strokeWidth={1} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={16} className="text-gray-300" stroke="currentColor" strokeWidth={1} />
      ))}
    </div>
  );
};

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
  // SOLUSI params error
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
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js"; 
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const script = document.createElement("script");
    script.src = midtransScriptUrl;
    script.setAttribute("data-client-key", clientKey || "");
    document.body.appendChild(script);

    async function fetchData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const { data: courseData } = await supabase.from("courses").select("*").eq("id", courseId).single();
      setCourse(courseData);

      if (courseData) {
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
    return () => { 
        if (document.body.contains(script)) document.body.removeChild(script); 
    }
  }, [courseId, supabase]);

  const handlePayment = async () => {
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

      const { token } = await response.json();

      (window as any).snap.pay(token, {
        onSuccess: async function(result: any) {
          toast.success("Pembayaran Berhasil!");
          await supabase.from("enrollments").insert({
            user_id: user.id,
            course_id: course.id,
            status: "active"
          });
          router.push("/dashboard/my-courses");
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

  const discountPercent = (course?.strike_price > course?.price) 
    ? Math.round(((course.strike_price - course.price) / course.strike_price) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24 selection:bg-[#00C9A7] selection:text-white">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-32 px-6 relative">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="lg:w-[60%] relative z-10">
             <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00C9A7] font-bold text-sm mb-6 transition bg-gray-50 hover:bg-teal-50 px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">
                <ArrowLeft size={16} /> Kembali ke Jelajah
             </Link>

             <div className="flex items-center text-sm text-[#00C9A7] font-bold mb-4 gap-2">
                <span>Program Klas</span>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-gray-900">Detail Kelas</span>
             </div>

             <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
                {course?.title}
             </h1>

             {course?.goals && (
                <div className="mb-8 bg-teal-50/50 p-5 rounded-2xl border border-teal-100">
                   <h3 className="text-sm font-black text-[#00C9A7] uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Target size={16} /> Your Goal
                   </h3>
                   <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium">
                      {course.goals}
                   </p>
                </div>
             )}

             <div className="flex flex-wrap items-center gap-4 mb-4 text-sm bg-gray-50 inline-flex p-2 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm text-[#00C9A7] font-bold rounded-lg border border-gray-100">
                   {course?.level || "Semua Level"}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5">
                   <span className="font-black text-gray-900 text-base">{course?.rating || "0"}</span>
                   <RenderStars rating={course?.rating || 0} />
                   <span className="text-gray-400 font-medium text-xs">
                      ({(course?.review_count || 0).toLocaleString("id-ID")} ulasan)
                   </span>
                </div>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                <span className="text-gray-900 font-bold flex items-center gap-1.5 px-2 text-xs">
                   <Users size={16} className="text-gray-400" /> {course?.sales_count || 0} Siswa Aktif
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col-reverse lg:flex-row gap-12 relative -mt-24">
        <div className="lg:w-[60%] space-y-8">
           <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Kurikulum Kelas</h2>
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-200">
                 {chapters.map((chapter, idx) => (
                    <details key={chapter.id} className="group bg-white" open={idx === 0}>
                       <summary className="p-5 flex items-center justify-between hover:bg-teal-50/50 transition cursor-pointer list-none outline-none">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#00C9A7] group-hover:text-white text-gray-600 rounded-xl flex items-center justify-center font-bold transition-colors">{idx + 1}</div>
                             <span className="font-bold text-gray-800 text-base">{chapter.title}</span>
                          </div>
                          <ChevronDown size={18} className="group-open:rotate-180 transition-transform text-[#00C9A7]" />
                       </summary>
                       <div className="bg-gray-50/80 px-5 py-4 border-t border-gray-100 flex flex-col gap-3">
                          {lessons.filter(l => l.chapter_id === chapter.id).map(lesson => (
                             <div key={lesson.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-[#00C9A7] transition-colors">
                                <PlayCircle size={20} className="text-[#00C9A7] shrink-0" />
                                <div className="flex-1 flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-800">{lesson.title}</h4>
                                    <span className="text-xs text-gray-400 font-bold">{getDurationText(lesson.duration)}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </details>
                 ))}
              </div>
           </div>
        </div>

        {/* CHECKOUT CARD */}
        <div className="lg:w-[40%]">
           <div className="lg:sticky top-28 bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden z-20">
              <div className="relative aspect-video w-full bg-gray-100">
                 {course?.thumbnail_url && <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />}
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white rounded-full p-4 shadow-2xl"><PlayCircle size={32} className="text-[#F97316] fill-current" /></div>
                 </div>
              </div>

              <div className="p-8">
                 <div className="mb-6 flex flex-col">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">Rp {course?.price.toLocaleString("id-ID")}</span>
                    {course?.strike_price > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-base text-gray-400 line-through font-bold">Rp {course.strike_price.toLocaleString("id-ID")}</span>
                           <span className="bg-orange-100 text-[#F97316] text-xs font-black px-2 py-1 rounded-md uppercase tracking-wide border border-orange-200">Diskon {discountPercent}%</span>
                        </div>
                    )}
                 </div>

                 <button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-4 font-bold text-lg rounded-2xl transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <>Beli Kelas Sekarang <ArrowRight size={20} /></>}
                 </button>

                 {/* --- UPDATE: FASILITAS EKSKLUSIF --- */}
                 <div className="mt-8 bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
                    <h4 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider">Fasilitas Eksklusif:</h4>
                    <ul className="space-y-4 text-sm text-gray-700 font-medium">
                       <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-[#00C9A7]"><PlayCircle size={18} /></div> 
                         Akses Video Selamanya
                       </li>
                       <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-[#00C9A7]"><FileCheck size={18} /></div> 
                         Tugas
                       </li>
                       <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-[#00C9A7]"><Infinity size={18} /></div> 
                         Akses penuh seumur hidup
                       </li>
                       <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-[#00C9A7]"><FileText size={18} /></div> 
                         Teks Keterangan
                       </li>
                       <li className="flex items-start gap-3">
                         <div className="mt-0.5 text-[#00C9A7]"><Trophy size={18} /></div> 
                         Sertifikat penyelesaian
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
