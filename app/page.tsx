"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle, 
  PlayCircle,
  Phone,
  Info
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fungsi scroll hanya untuk bagian Program di halaman ini
  const scrollToProgram = () => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById("program");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#00C9A7] selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-[#00C9A7] rounded-lg flex items-center justify-center text-white">
                <BookOpen size={24} strokeWidth={3} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Klas<span className="text-[#00C9A7]">Konstruksi</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Beranda
              </Link>
              {/* Program Kelas pakai scroll karena ada di halaman ini */}
              <button onClick={scrollToProgram} className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Program Kelas
              </button>
              {/* Link ke Halaman About */}
              <Link href="/about" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Tentang Kami
              </Link>
              {/* Link ke Halaman Contact */}
              <Link href="/contact" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Hubungi Kami
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-5 py-2.5 text-gray-600 font-bold hover:text-gray-900 transition-colors"
              >
                Masuk
              </Link>
              <Link 
                href="/register" 
                className="px-5 py-2.5 bg-[#00C9A7] hover:bg-[#00b596] text-white font-bold rounded-full transition-all shadow-lg shadow-[#00C9A7]/30 flex items-center gap-2"
              >
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-900 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Beranda
              </Link>
              <button onClick={scrollToProgram} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Program Kelas
              </button>
              <Link href="/about" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Tentang Kami
              </Link>
              <Link href="/contact" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Hubungi Kami
              </Link>
              <div className="border-t border-gray-100 my-2 pt-2 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/register" className="w-full text-center py-3 bg-[#00C9A7] text-white font-bold rounded-lg hover:bg-[#00b596]">Daftar Gratis</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-[#00C9A7] text-sm font-bold mb-6 border border-green-100">
                <span className="flex h-2 w-2 rounded-full bg-[#00C9A7]"></span>
                Platform Belajar Konstruksi No.1
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15] mb-6">
                Bangun Karir Impian di Dunia <span className="text-[#00C9A7]">Konstruksi</span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                Pelajari skill teknik sipil dan arsitektur langsung dari praktisi industri. Materi terstruktur, studi kasus nyata, dan sertifikat kompetensi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="px-8 py-4 bg-[#00C9A7] hover:bg-[#00b596] text-white font-bold rounded-xl transition-all shadow-xl shadow-[#00C9A7]/20 flex items-center justify-center gap-2 text-lg"
                >
                  Mulai Belajar Gratis
                </Link>
                <button 
                  onClick={scrollToProgram}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:border-gray-400 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <PlayCircle size={20} /> Lihat Program
                </button>
              </div>
              
              <div className="mt-10 flex items-center gap-4 text-sm text-gray-500">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden`}>
                           <div className="bg-gray-300 w-full h-full"></div>
                        </div>
                    ))}
                 </div>
                 <p>Dipercaya oleh <span className="font-bold text-gray-900">2,000+</span> Engineer</p>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:h-[600px] w-full flex items-center justify-center">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C9A7]/10 rounded-full blur-3xl -z-10"></div>
               
               <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-all duration-500 w-full max-w-md mx-auto aspect-[4/5]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                     <span className="text-center p-4">Gambar Hero (Construction Site / Engineer)</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="bg-gray-50 py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Siswa Aktif", value: "2.5K+", icon: Users },
              { label: "Modul Materi", value: "150+", icon: BookOpen },
              { label: "Mentor Ahli", value: "20+", icon: Award },
              { label: "Rating Puas", value: "4.9/5", icon: CheckCircle },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <stat.icon className="text-[#00C9A7] mb-3 w-8 h-8" />
                <h3 className="text-3xl font-extrabold text-gray-900">{stat.value}</h3>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION (ID: program) --- */}
      <section id="program" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih KlasKonstruksi?</h2>
            <p className="text-gray-500 text-lg">Metode pembelajaran yang dirancang khusus untuk kebutuhan industri konstruksi modern.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#00C9A7] hover:shadow-xl hover:shadow-[#00C9A7]/5 transition-all group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Kurikulum Industri</h3>
                <p className="text-gray-500 leading-relaxed">Materi disusun berdasarkan standar SKKNI dan kebutuhan proyek nyata di lapangan.</p>
             </div>

             <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#00C9A7] hover:shadow-xl hover:shadow-[#00C9A7]/5 transition-all group">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                   <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mentor Praktisi</h3>
                <p className="text-gray-500 leading-relaxed">Belajar langsung dari Project Manager, Site Engineer, dan Arsitek berpengalaman.</p>
             </div>

             <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#00C9A7] hover:shadow-xl hover:shadow-[#00C9A7]/5 transition-all group">
                <div className="w-14 h-14 bg-green-50 text-[#00C9A7] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00C9A7] group-hover:text-white transition-colors">
                   <Award size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sertifikat Kompetensi</h3>
                <p className="text-gray-500 leading-relaxed">Dapatkan sertifikat yang valid untuk portofolio karir profesional Anda.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={18} />
              </div>
              <span className="font-bold text-lg text-gray-900">KlasKonstruksi</span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 KlasKonstruksi. All rights reserved.</p>
            <div className="flex gap-6">
               <Link href="/about" className="text-gray-400 hover:text-gray-900 text-sm">Tentang Kami</Link>
               <Link href="/contact" className="text-gray-400 hover:text-gray-900 text-sm">Hubungi Kami</Link>
               <Link href="#" className="text-gray-400 hover:text-gray-900 text-sm">Instagram</Link>
            </div>
         </div>
      </footer>

    </div>
  );
}