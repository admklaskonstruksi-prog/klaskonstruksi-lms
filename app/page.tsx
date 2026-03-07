"use client";
export const runtime = 'edge';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle, 
  PlayCircle,
  Star,
  StarHalf,
  BookText
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [highlightCourses, setHighlightCourses] = useState<any[]>([]);
  const [latestEbooks, setLatestEbooks] = useState<any[]>([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    
    async function fetchHighlightCourses() {
      try {
        const { data } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("sales_count", { ascending: false })
          .limit(6);
        if (data) setHighlightCourses(data);
      } catch {}
    }

    async function fetchEbooks() {
      try {
        const { data } = await supabase
          .from("ebooks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4);
        if (data) setLatestEbooks(data);
      } catch {}
    }

    fetchHighlightCourses();
    fetchEbooks();
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#00C9A7] selection:text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image src="/logo.png" alt="Logo Klas Konstruksi" width={160} height={160} className="object-contain" priority/>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-[#00C9A7] font-bold transition-colors">Beranda</Link>
              <button onClick={() => scrollToSection("program")} className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Program Klas</button>
              <Link href="/ebooks" className="text-[#00C9A7] font-bold transition-colors">Katalog E-Book</Link>
              <button onClick={() => scrollToSection("mentor")} className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Daftar Mentor</button>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors">Masuk</Link>
              <Link href="/login?mode=register" className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/30 flex items-center gap-2 hover:-translate-y-0.5">
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-[#00C9A7] focus:outline-none">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-base font-bold text-[#00C9A7] bg-teal-50 rounded-lg">Beranda</Link>
              <button onClick={() => scrollToSection("program")} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Program Klas</button>
              <button onClick={() => scrollToSection("mentor")} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Daftar Mentor</button>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/login?mode=register" className="w-full text-center py-3 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-[#00C9A7] text-sm font-bold mb-6 border border-teal-100">
                <span className="flex h-2 w-2 rounded-full bg-[#00C9A7] animate-pulse"></span>
                Platform Belajar Konstruksi No.1
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15] mb-6 tracking-tight">
                Bangun Karir Impian di Dunia <span className="text-[#00C9A7]">Konstruksi</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                Pelajari skill teknik sipil, manajemen proyek, dan arsitektur langsung dari praktisi industri. Materi terstruktur dan siap kerja!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login?mode=register" className="px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 text-lg hover:-translate-y-1">
                  Mulai Belajar Sekarang <ArrowRight size={20} />
                </Link>
                <button onClick={() => scrollToSection("program")} className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-all flex items-center justify-center gap-2 text-lg">
                  <PlayCircle size={20} /> Lihat Program
                </button>
              </div>
            </div>
            <div className="relative lg:h-[550px] w-full flex items-center justify-center z-10">
               <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00C9A7]/20 rounded-full blur-3xl -z-10"></div>
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white w-full max-w-md aspect-[4/5] transform lg:rotate-2 hover:rotate-0 transition-all duration-500">
                  <Image src="https://picsum.photos/id/249/1000/1250" alt="Engineer in action" fill className="object-cover" priority/>
                  <div className="absolute bottom-6 -left-4 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce hidden sm:flex border border-gray-100">
                    <div className="w-10 h-10 bg-teal-100 text-[#00C9A7] rounded-full flex items-center justify-center"><CheckCircle size={20} /></div>
                    <div><p className="font-bold text-gray-900 text-sm">100% Praktis</p><p className="text-xs text-gray-500">Studi kasus nyata</p></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT KELAS */}
      <section id="program" className="py-20 bg-gray-50 border-y border-gray-100 overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h2 className="text-3xl font-bold text-gray-900">Program Terpopuler</h2>
                <p className="text-gray-500 mt-2">Pilihan kelas terbaik yang paling banyak diminati.</p>
             </div>
             <Link href="/program" className="hidden md:flex items-center gap-2 text-[#00C9A7] font-bold hover:text-[#00b596]">
                Lihat Semua <ArrowRight size={18} />
             </Link>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {highlightCourses.length > 0 ? (
               highlightCourses.map((course) => (
                  <Link href={`/program/${course.id}`} key={course.id} className="min-w-[280px] sm:min-w-[320px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#00C9A7]/50 hover:-translate-y-1 transition-all duration-300 snap-start flex flex-col group">
                     <div className="aspect-video relative bg-gray-100 border-b border-gray-100 overflow-hidden">
                        {course.thumbnail_url ? (
                           <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                        <div className="absolute top-3 left-3 bg-[#F97316] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm tracking-wider uppercase">Terlaris</div>
                     </div>
                     <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-1 group-hover:text-[#00C9A7] transition-colors">{course.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">Klas Konstruksi</p>
                        <div className="flex items-center gap-1 text-xs mb-3">
                           <span className="font-bold text-[#f69c08]">{course.rating || "4.8"}</span>
                           <div className="flex text-[#f69c08]">
                              <Star size={12} fill="currentColor" strokeWidth={0} />
                              <Star size={12} fill="currentColor" strokeWidth={0} />
                              <Star size={12} fill="currentColor" strokeWidth={0} />
                              <Star size={12} fill="currentColor" strokeWidth={0} />
                              <StarHalf size={12} fill="currentColor" strokeWidth={0} />
                           </div>
                           <span className="text-gray-500">({(course.review_count || 120).toLocaleString("id-ID")})</span>
                        </div>
                        <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                        {Number(course.price || 0) > 0 ? (
                              <><span className="font-bold text-gray-900 text-lg">Rp {course.price.toLocaleString("id-ID")}</span></>
                           ) : (
                              <span className="font-bold text-[#00C9A7] text-lg">Gratis</span>
                           )}
                        </div>
                     </div>
                  </Link>
               ))
            ) : (
               <>{[1,2,3,4].map((i) => (<div key={i} className="min-w-[280px] sm:min-w-[320px] aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse snap-start border border-gray-200"></div>))}</>
            )}
          </div>
        </div>
      </section>

      {/* ================= SECTION E-BOOK TERBARU (TANPA TOMBOL CART) ================= */}
      {latestEbooks.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  E-Book Eksklusif <span className="text-[#F97316]">KlasKonstruksi</span>
                </h2>
                <p className="text-gray-500">Modul dan panduan tertulis langsung dari praktisi industri.</p>
              </div>
              <Link href="/ebooks" className="text-sm font-bold text-[#00C9A7] hover:text-teal-500 bg-teal-50 px-5 py-2.5 rounded-xl transition-colors shrink-0 text-center inline-block">
                Lihat Semua E-Book &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestEbooks.map((ebook) => (
                <Link href={`/ebooks/${ebook.id}`} key={ebook.id} className="group">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col">
                    <div className="aspect-[4/3] bg-gradient-to-br from-teal-900 to-gray-900 relative flex items-center justify-center p-6 text-center">
                      <div className="absolute top-3 left-3 bg-[#F97316] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-md">
                        E-Book
                      </div>
                      <h3 className="text-white font-bold text-base leading-snug line-clamp-3 drop-shadow-md">
                        {ebook.title}
                      </h3>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-sm mb-4 line-clamp-2 group-hover:text-[#00C9A7] transition-colors">
                        {ebook.title}
                      </h3>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-sm font-black text-[#00C9A7]">
                          {ebook.price === 0 ? "GRATIS" : `Rp ${ebook.price.toLocaleString("id-ID")}`}
                        </span>
                        <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <BookText size={12} /> {ebook.sold_count} terjual
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* ================= AKHIR SECTION E-BOOK ================= */}

      {/* --- MENTOR SECTION --- */}
      <section id="mentor" className="py-24 bg-white border-y border-gray-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-teal-50/50 rounded-3xl p-8 md:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20 border border-teal-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C9A7]/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="md:w-1/2 z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Punya Pengalaman Proyek? <br /><span className="text-[#00C9A7]">Jadilah Mentor Kami!</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Bagikan ilmu dan pengalaman berharga Anda di dunia konstruksi kepada ribuan engineer muda. Mulai bangun personal branding dan dapatkan penghasilan tambahan tanpa batas.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-[#00C9A7] flex items-center justify-center shrink-0"><CheckCircle size={16} /></div>
                  <span className="text-gray-800 font-medium">Penghasilan pasif dari setiap penjualan kelas</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-[#00C9A7] flex items-center justify-center shrink-0"><CheckCircle size={16} /></div>
                  <span className="text-gray-800 font-medium">Tingkatkan otoritas dan personal branding Anda</span>
                </li>
              </ul>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-1">
                Daftar Sebagai Mentor <ArrowRight size={20} />
              </Link>
            </div>
            <div className="md:w-1/2 relative z-10 w-full max-w-md mx-auto">
              <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform lg:-rotate-3 hover:rotate-0 transition-all duration-500">
                <Image src="https://picsum.photos/id/60/800/800" alt="Menjadi Mentor" fill className="object-cover"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-4 border-[#00C9A7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="Logo Bawah" width={80} height={80} className="rounded object-contain opacity-90 bg-white" />
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mt-4">
              Platform e-learning teknik sipil dan konstruksi terlengkap. Kami berdedikasi untuk mencetak engineer dan praktisi handal yang siap menghadapi tantangan proyek nyata.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}