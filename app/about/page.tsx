"use client";
export const runtime = 'nodejs';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  Target, Zap, Layers, CheckCircle, Menu, X, ArrowRight
} from "lucide-react";

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
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

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Beranda
              </Link>
              <Link href="/program" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Program Klas
              </Link>
              <Link href="/ebooks" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Katalog E-Book
              </Link>
              <Link href="/#mentor" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Daftar Mentor
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors">
                Masuk
              </Link>
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
              <Link href="/" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Beranda</Link>
              <Link href="/program" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Program Klas
              </Link>
              <Link href="/ebooks" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">
                Katalog E-Book
              </Link>
              <Link href="/#mentor" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Daftar Mentor</Link>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/login?mode=register" className="w-full text-center py-3 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- KONTEN ABOUT US --- */}
      <main className="max-w-5xl mx-auto py-20 px-6 space-y-24">
        
        {/* SECTION 1: HOOK & THE PROBLEM */}
        <section className="text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                Tentang <span className="text-[#00C9A7]">KLAS Konstruksi</span>
            </h1>
            <div className="text-lg md:text-xl text-gray-600 leading-relaxed space-y-4">
                <p className="font-medium text-gray-800">
                    Banyak lulusan teknik keluar dari kampus dengan nilai bagus. Tapi saat masuk ke proyek, mereka bingung harus mulai dari mana.
                </p>
                <p>
                    Bukan karena mereka tidak mampu. Tapi karena apa yang dipelajari tidak sepenuhnya sesuai dengan kebutuhan di lapangan.
                </p>
            </div>
        </section>

        {/* SECTION 2: THE SOLUTION */}
        <section className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] rounded-full blur-3xl -z-0 opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00C9A7] rounded-full blur-3xl -z-0 opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <p className="text-2xl md:text-3xl font-bold leading-snug">
                    KLAS Konstruksi hadir untuk menjembatani gap tersebut.
                </p>
                <p className="text-gray-300 text-lg md:text-xl">
                    Sebuah platform pembelajaran yang dirancang agar kamu tidak hanya paham teori, tapi juga siap bekerja di dunia konstruksi.
                </p>
            </div>
        </section>

        {/* SECTION 3: LEARNING STAGES */}
        <section>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-gray-900 mb-4">Sistem Belajar Bertahap</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl text-center group hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00C9A7] mx-auto mb-6 group-hover:bg-[#00C9A7] group-hover:text-white transition-colors"><Layers size={32} /></div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Foundation</h3>
                    <p className="text-gray-500 font-medium">Memahami dasar konstruksi</p>
                </div>
                
                <div className="bg-[#00C9A7] p-8 rounded-3xl shadow-xl text-center text-white transform md:scale-105 z-10 hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6"><CheckCircle size={32} /></div>
                    <h3 className="text-2xl font-black mb-2">Professional</h3>
                    <p className="text-teal-50 font-medium">Siap masuk dunia kerja</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl text-center group hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto mb-6 group-hover:bg-[#F97316] group-hover:text-white transition-colors"><Target size={32} /></div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Expert</h3>
                    <p className="text-gray-500 font-medium">Siap mengelola proyek</p>
                </div>
            </div>
        </section>

        {/* SECTION 4: CLOSING */}
        <section className="bg-teal-50 rounded-[3rem] p-10 md:p-16 text-center border border-teal-100 relative overflow-hidden">
            <Zap className="w-12 h-12 text-[#F97316] mx-auto mb-6 relative z-10" />
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium mb-8 relative z-10">
                Setiap materi disusun berdasarkan praktik nyata di lapangan, sehingga bisa langsung diterapkan.
            </p>
            <div className="inline-block bg-white px-8 md:px-12 py-8 rounded-3xl shadow-sm border border-gray-100 relative z-10 transform hover:scale-105 transition duration-300">
                <p className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                    KLAS bukan sekadar tempat belajar.
                </p>
                <p className="text-[#00C9A7] font-bold text-lg md:text-xl">
                    KLAS adalah tempat untuk jadi siap kerja di industri konstruksi.
                </p>
            </div>
        </section>

      </main>

     {/* --- FOOTER--- */}
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
              <li><Link href="/program" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Program Klas
              </Link></li>
              <li><Link href="/ebooks" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Katalog E-Book
              </Link></li>
              <li><Link href="/#mentor" className="hover:text-[#00C9A7] transition-colors">Daftar Mentor</Link></li>
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
          <p>
  © {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi. Dev by{" "}
  <a 
    href="https://askaraindonesia.com" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="font-medium text-gray-400 hover:text-[#00C9A7] transition-colors"
  >
    Askara Indonesia
  </a>
</p>
          <div className="flex gap-6">
             <Link href="https://www.instagram.com/klaskonstruksi" className="hover:text-white transition-colors">Instagram</Link>
             <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
             <Link href="#" className="hover:text-white transition-colors">YouTube</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}