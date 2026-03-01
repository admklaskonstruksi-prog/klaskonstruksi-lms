"use client";

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
  StarHalf
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [highlightCourses, setHighlightCourses] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchHighlightCourses() {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("sales_count", { ascending: false })
        .limit(6);
      
      if (data) setHighlightCourses(data);
    }
    fetchHighlightCourses();
  }, [supabase]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    // SELECTION TEXT MENGGUNAKAN TOSCA
    <div className="min-h-screen bg-white font-sans selection:bg-[#00C9A7] selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                 src="/logo.png" 
                 alt="Logo Klas Konstruksi" 
                 width={160} 
                 height={160} 
                 className="object-contain" 
                 priority
              />
            </Link>

            {/* Desktop Menu - Hover Tosca */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-[#00C9A7] font-bold transition-colors">
                Beranda
              </Link>
              <button onClick={() => scrollToSection("program")} className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Program Klas
              </button>
              <button onClick={() => scrollToSection("mentor")} className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Daftar Mentor
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Masuk = Tosca Hover */}
              <Link 
                href="/login" 
                className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors"
              >
                Masuk
              </Link>
              {/* HIGHLIGHT: Daftar = Orange! */}
              <Link 
                href="/login?mode=register" 
                className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/30 flex items-center gap-2 hover:-translate-y-0.5"
              >
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button - Hover Tosca */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-[#00C9A7] focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-base font-bold text-[#00C9A7] bg-teal-50 rounded-lg">
                Beranda
              </Link>
              <button onClick={() => scrollToSection("program")} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Program Klas
              </button>
              <button onClick={() => scrollToSection("mentor")} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Daftar Mentor
              </button>
              
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                {/* HIGHLIGHT Orange */}
                <Link href="/login?mode=register" className="w-full text-center py-3 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="max-w-2xl z-10">
              {/* Badge Tosca */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-[#00C9A7] text-sm font-bold mb-6 border border-teal-100">
                <span className="flex h-2 w-2 rounded-full bg-[#00C9A7] animate-pulse"></span>
                Platform Belajar Konstruksi No.1
              </div>
              
              {/* Kata Konstruksi pakai Tosca */}
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15] mb-6 tracking-tight">
                Bangun Karir Impian di Dunia <span className="text-[#00C9A7]">Konstruksi</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                Pelajari skill teknik sipil, manajemen proyek, dan arsitektur langsung dari praktisi industri. Materi terstruktur dan siap kerja!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* HIGHLIGHT: CTA Orange */}
                <Link 
                  href="/login?mode=register" 
                  className="px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 text-lg hover:-translate-y-1"
                >
                  Mulai Belajar Sekarang <ArrowRight size={20} />
                </Link>
                {/* Tombol sekunder Tosca */}
                <button 
                  onClick={() => scrollToSection("program")}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-[#00C9A7] hover:text-[#00C9A7] transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <PlayCircle size={20} /> Lihat Program
                </button>
              </div>
            </div>

            <div className="relative lg:h-[550px] w-full flex items-center justify-center z-10">
               {/* Background Blur Tosca */}
               <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00C9A7]/20 rounded-full blur-3xl -z-10"></div>
               
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white w-full max-w-md aspect-[4/5] transform lg:rotate-2 hover:rotate-0 transition-all duration-500">
                  <Image 
                    src="https://picsum.photos/id/249/1000/1250" 
                    alt="Engineer in action"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Badge Melayang Tosca */}
                  <div className="absolute bottom-6 -left-4 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce hidden sm:flex border border-gray-100">
                    <div className="w-10 h-10 bg-teal-100 text-[#00C9A7] rounded-full flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">100% Praktis</p>
                      <p className="text-xs text-gray-500">Studi kasus nyata</p>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- HIGHLIGHT KELAS (CAROUSEL) --- */}
      <section id="program" className="py-20 bg-gray-50 border-y border-gray-100 overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h2 className="text-3xl font-bold text-gray-900">Program Terpopuler</h2>
                <p className="text-gray-500 mt-2">Pilihan kelas terbaik yang paling banyak diminati.</p>
             </div>
             {/* Link lihat semua Tosca */}
             <Link href="/program" className="hidden md:flex items-center gap-2 text-[#00C9A7] font-bold hover:text-[#00b596]">
                Lihat Semua <ArrowRight size={18} />
             </Link>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {highlightCourses.length > 0 ? (
               highlightCourses.map((course) => (
                  <Link 
                     href={`/dashboard/checkout/${course.id}`} 
                     key={course.id} 
                     // Hover border Tosca
                     className="min-w-[280px] sm:min-w-[320px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#00C9A7]/50 hover:-translate-y-1 transition-all duration-300 snap-start flex flex-col group"
                  >
                     <div className="aspect-video relative bg-gray-100 border-b border-gray-100 overflow-hidden">
                        {course.thumbnail_url ? (
                           <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                        {/* Label HIGHLIGHT Orange */}
                        <div className="absolute top-3 left-3 bg-[#F97316] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm tracking-wider uppercase">
                           Terlaris
                        </div>
                     </div>

                     <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-1 group-hover:text-[#00C9A7] transition-colors">
                           {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">Klas Konstruksi</p>
                        
                        {/* Bintang Rating menggunakan warna emas agar natural */}
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
                           {course.price > 0 ? (
                              <>
                                 <span className="font-bold text-gray-900 text-lg">Rp {course.price.toLocaleString("id-ID")}</span>
                                 {course.strike_price > 0 && (
                                    <span className="text-gray-400 line-through text-xs">Rp {course.strike_price.toLocaleString("id-ID")}</span>
                                 )}
                              </>
                           ) : (
                              // Teks Gratis pakai Tosca
                              <span className="font-bold text-[#00C9A7] text-lg">Gratis</span>
                           )}
                        </div>
                     </div>
                  </Link>
               ))
            ) : (
               <>
                 {[1,2,3,4].map((i) => (
                    <div key={i} className="min-w-[280px] sm:min-w-[320px] aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse snap-start border border-gray-200"></div>
                 ))}
               </>
            )}
          </div>
        </div>
      </section>

      {/* --- MENTOR SECTION (DOMINAN TOSCA + HIGHLIGHT ORANGE) --- */}
      <section id="mentor" className="py-24 bg-white border-b border-gray-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-teal-50/50 rounded-3xl p-8 md:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20 border border-teal-100 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C9A7]/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="md:w-1/2 z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Punya Pengalaman Proyek? <br />
                <span className="text-[#00C9A7]">Jadilah Mentor Kami!</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Bagikan ilmu dan pengalaman berharga Anda di dunia konstruksi kepada ribuan engineer muda di seluruh Indonesia. Mulai bangun *personal branding* dan dapatkan penghasilan tambahan tanpa batas.
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-[#00C9A7] flex items-center justify-center shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-gray-800 font-medium">Penghasilan pasif dari setiap penjualan kelas</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-[#00C9A7] flex items-center justify-center shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-gray-800 font-medium">Tingkatkan otoritas dan *personal branding* Anda</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-[#00C9A7] flex items-center justify-center shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-gray-800 font-medium">Waktu fleksibel, cukup rekam materi dari rumah</span>
                </li>
              </ul>

              {/* HIGHLIGHT CTA: ORANGE! */}
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-1"
              >
                Daftar Sebagai Mentor <ArrowRight size={20} />
              </Link>
            </div>
            
            <div className="md:w-1/2 relative z-10 w-full max-w-md mx-auto">
              <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform lg:-rotate-3 hover:rotate-0 transition-all duration-500">
                <Image 
                  src="https://picsum.photos/id/60/800/800" 
                  alt="Menjadi Mentor Klas Konstruksi" 
                  fill 
                  className="object-cover"
                />
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 text-[#F97316] rounded-full flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Mentor Ahli</p>
                  <p className="text-xs text-gray-500">20+ Praktisi Bergabung</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            {[
              { label: "Siswa Aktif", value: "2.5K+", icon: Users },
              { label: "Modul Materi", value: "150+", icon: BookOpen },
              { label: "Mentor Ahli", value: "20+", icon: Award },
              { label: "Rating Puas", value: "4.9/5", icon: CheckCircle },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* Ikon Stat Tosca */}
                <stat.icon className="text-[#00C9A7] mb-4 w-8 h-8" />
                <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih KlasKonstruksi?</h2>
            <p className="text-gray-500 text-lg">Metode pembelajaran yang dirancang khusus untuk kebutuhan industri konstruksi modern.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#00C9A7] hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-teal-50 text-[#00C9A7] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00C9A7] group-hover:text-white transition-colors">
                   <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Kurikulum Industri</h3>
                <p className="text-gray-500 leading-relaxed">Materi disusun berdasarkan standar SKKNI dan kebutuhan proyek nyata di lapangan.</p>
             </div>

             <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#00C9A7] hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-teal-50 text-[#00C9A7] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00C9A7] group-hover:text-white transition-colors">
                   <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mentor Praktisi</h3>
                <p className="text-gray-500 leading-relaxed">Belajar langsung dari Project Manager, Site Engineer, dan Arsitek berpengalaman.</p>
             </div>

             <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#00C9A7] hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-teal-50 text-[#00C9A7] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00C9A7] group-hover:text-white transition-colors">
                   <Award size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sertifikat Kompetensi</h3>
                <p className="text-gray-500 leading-relaxed">Dapatkan sertifikat yang valid untuk memperkuat portofolio karir profesional Anda.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-4 border-[#00C9A7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image 
                 src="/logo.png" 
                 alt="Logo Bawah" 
                 width={80} 
                 height={80} 
                 className="rounded object-contain opacity-90 grayscale hover:grayscale-0 transition-all bg-white" 
              />
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mt-4">
              Platform e-learning teknik sipil dan konstruksi terlengkap. Kami berdedikasi untuk mencetak engineer dan praktisi handal yang siap menghadapi tantangan proyek nyata.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Menu Navigasi</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#00C9A7] transition-colors">Beranda</Link></li>
              <li><button onClick={() => scrollToSection("program")} className="hover:text-[#00C9A7] transition-colors">Program Klas</button></li>
              <li><button onClick={() => scrollToSection("mentor")} className="hover:text-[#00C9A7] transition-colors">Daftar Mentor</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Informasi Lain</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#00C9A7] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-[#00C9A7] transition-colors">Hubungi Kami</Link></li>
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
             <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
             <Link href="#" className="hover:text-white transition-colors">YouTube</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}