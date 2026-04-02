"use client";
export const runtime = 'nodejs';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Star, ArrowRight, Menu, X, BookText } from "lucide-react";
import AddToCartMini from "@/app/components/AddToCartMini";
import FloatingCartPublic from "@/app/components/FloatingCartPublic";

export default function PublicEbooksCatalog() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchEbooks() {
      try {
        const { data } = await supabase
          .from("ebooks")
          .select("*")
          .eq("is_published", true) // <-- TAMBAHAN FILTER: HANYA TAMPILKAN YANG PUBLISHED (LIVE)
          .order("created_at", { ascending: false });
        if (data) setEbooks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEbooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#00C9A7] selection:text-white flex flex-col">
      
      {/* ================= NAVBAR (Sama dengan Homepage) ================= */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image src="/logo.png" alt="Logo Klas Konstruksi" width={160} height={160} className="object-contain" priority/>
            </Link>

            {/* Desktop Menu */}
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
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors">Masuk</Link>
              <Link href="/login?mode=register" className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/30 flex items-center gap-2 hover:-translate-y-0.5">
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
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
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg transition-colors">
                Beranda
              </Link>
              <Link href="/program" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-base font-bold text-[#00C9A7] bg-teal-50 rounded-lg transition-colors">
                Program Klas
              </Link>
              <Link href="/ebooks" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg transition-colors">
                Katalog E-Book
              </Link>
              <Link href="/#mentor" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg transition-colors">
                Daftar Mentor
              </Link>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Masuk
                </Link>
                <Link href="/login?mode=register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C] transition-colors">
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ================= HERO SECTION E-BOOK ================= */}
      <div className="bg-gray-950 text-white pt-16 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500 via-gray-900 to-black"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800 text-[#00C9A7] text-sm font-bold mb-6 border border-gray-700">
            <BookOpen size={16} /> Literasi Konstruksi
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
            Katalog <span className="text-[#00C9A7]">E-Book Eksklusif</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Kumpulan panduan, modul, dan referensi berharga untuk mendukung karir Anda di dunia konstruksi profesional. Unduh instan, baca selamanya.
          </p>
        </div>
      </div>

      {/* ================= GRID KATALOG E-BOOK ================= */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 relative z-20 pb-24">
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
             {[1,2,3,4].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-4 shadow-xl shadow-gray-200/50 border border-gray-100 aspect-[3/4] animate-pulse"></div>
             ))}
          </div>
        ) : (!ebooks || ebooks.length === 0) ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xl shadow-gray-200/50">
             <BookOpen size={64} className="mx-auto text-gray-200 mb-6" />
             <h3 className="text-2xl font-black text-gray-900 mb-2">E-Book Belum Tersedia</h3>
             <p className="text-gray-500 max-w-md mx-auto">Kami sedang menyusun modul-modul terbaik untuk Anda. Nantikan rilis e-book terbaru kami segera!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col group">
                
                <Link href={`/ebooks/${ebook.id}`} className="block">
                  <div className="aspect-[3/4] relative bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100">
                    {ebook.cover_url ? (
                      <Image src={ebook.cover_url} alt={ebook.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="bg-gradient-to-br from-teal-900 to-gray-900 w-full h-full flex flex-col items-center justify-center p-8 text-center gap-4">
                        <BookOpen size={48} className="text-white/30" />
                        <h3 className="text-white font-bold text-xl drop-shadow-md">{ebook.title}</h3>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#F97316] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                      PDF File
                    </div>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[10px] font-bold text-[#00C9A7] uppercase tracking-wider mb-2">MODUL KONSTRUKSI</p>
                  <Link href={`/ebooks/${ebook.id}`} className="block mb-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-[#00C9A7] transition-colors">{ebook.title}</h3>
                  </Link>

                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-6">
                     <span className="flex items-center gap-1 text-[#f69c08] bg-orange-50 px-2 py-1 rounded font-bold"><Star size={12} className="fill-current" /> {Number(ebook.rating || 5).toFixed(1)}</span>
                     <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><BookText size={12} /> {ebook.sold_count || 0} Terjual</span>
                  </div>

                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Harga E-Book</p>
                      <span className="text-xl font-black text-[#00C9A7]">
                        {ebook.price === 0 ? "GRATIS" : `Rp ${ebook.price.toLocaleString("id-ID")}`}
                      </span>
                    </div>
                    {/* Tombol Keranjang Mini */}
                    <AddToCartMini item={ebook} />
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FLOATING CART ================= */}
      <FloatingCartPublic />

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-4 border-[#00C9A7] mt-auto">
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
              <Link href="/program" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Program Klas
              </Link>
              <Link href="/ebooks" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Katalog E-Book
              </Link>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Informasi Lain</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Hubungi Kami</Link></li>
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
             <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}