"use client";
export const runtime = 'nodejs';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ArrowRight, ShieldCheck, FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#00C9A7] selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image src="/logo.png" alt="Logo Klas Konstruksi" width={160} height={160} className="object-contain" priority />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Beranda</Link>
              <Link href="/program" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Program Klas</Link>
              <Link href="/ebooks" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Katalog E-Book</Link>
              <Link href="/#mentor" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Daftar Mentor</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors">Masuk</Link>
              <Link href="/login?mode=register" className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#00C9A7]/30 flex items-center gap-2 hover:-translate-y-0.5">
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
      </nav>

      {/* --- HEADER --- */}
      <div className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <FileText className="w-12 h-12 text-[#00C9A7] mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Syarat & Ketentuan</h1>
            <p className="text-gray-500 text-lg">Harap baca ketentuan penggunaan layanan kami dengan saksama sebelum Anda mulai belajar bersama kami.</p>
        </div>
      </div>

      {/* --- ISI KONTEN --- */}
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="prose prose-lg text-gray-700 space-y-10 max-w-none">
            
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00C9A7] pl-4">1. Ketentuan Penggunaan</h2>
                <p>
                    Dengan mengakses dan menggunakan situs <strong>Klas Konstruksi</strong> (PT. Klas Mahir Konstruksi), Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda wajib menghentikan penggunaan situs ini segera.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00C9A7] pl-4">2. Pendaftaran Akun</h2>
                <p>Untuk mengakses materi kursus tertentu, Anda diwajibkan mendaftar akun. Anda bertanggung jawab penuh untuk:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Menjaga kerahasiaan kata sandi dan informasi akun Anda.</li>
                    <li>Memberikan informasi data diri yang akurat dan terbaru.</li>
                    <li>Aktivitas apa pun yang terjadi di bawah akun Anda.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00C9A7] pl-4">3. Pembayaran & Harga</h2>
                <p>
                    Semua transaksi pembayaran dilakukan melalui sistem <strong>Midtrans</strong>. Harga yang tercantum pada situs adalah harga final dalam Rupiah (IDR). Kami berhak mengubah harga sewaktu-waktu tanpa pemberitahuan sebelumnya, namun perubahan tersebut tidak akan memengaruhi pesanan yang telah dibayar.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00C9A7] pl-4">4. Kebijakan Pengembalian Dana (Refund)</h2>
                <p>
                    Karena layanan kami bersifat produk digital (akses kursus dan e-book yang dapat langsung dikonsumsi), semua pembelian bersifat <strong>final dan tidak dapat dibatalkan atau dikembalikan</strong>, kecuali terdapat kesalahan sistem teknis dari pihak kami yang menyebabkan akses gagal diberikan secara permanen.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00C9A7] pl-4">5. Hak Kekayaan Intelektual</h2>
                <p>
                    Seluruh konten yang tersedia di situs ini, termasuk namun tidak terbatas pada teks, video, desain grafis, e-book, dan logo, adalah milik sah dari PT. Klas Mahir Konstruksi. Anda dilarang keras menyalin, mendistribusikan ulang, menjual, atau menyebarluaskan materi kami tanpa izin tertulis resmi dari kami.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00C9A7] pl-4">6. Batasan Tanggung Jawab</h2>
                <p>
                    Klas Konstruksi tidak bertanggung jawab atas kerugian tidak langsung atau masalah teknis yang timbul dari penyedia layanan internet atau perangkat keras pengguna. Materi yang kami berikan bersifat edukatif dan hasil penerapan di lapangan dapat bervariasi tergantung kondisi proyek masing-masing pengguna.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#00C9A7] pl-4">7. Hukum yang Berlaku</h2>
                <p>
                    Syarat dan ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di <strong>Negara Republik Indonesia</strong>. Segala sengketa yang timbul akan diselesaikan melalui musyawarah atau di pengadilan wilayah Kota Malang.
                </p>
            </section>

            <div className="bg-[#00C9A7]/5 p-8 rounded-3xl border border-[#00C9A7]/20 flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-[#00C9A7] shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-gray-900 mb-2">Pertanyaan Lebih Lanjut?</h4>
                    <p className="text-sm text-gray-600">Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi tim administrasi kami melalui WhatsApp di <strong>0821-2000-2589</strong> atau email di <strong>halo@klaskonstruksi.id</strong>.</p>
                </div>
            </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-4 border-[#00C9A7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="Logo Bawah" width={80} height={80} className="rounded object-contain bg-white" />
            </Link>
            <p className="text-gray-400 text-sm max-w-md">Platform e-learning teknik sipil dan konstruksi terlengkap. Kami berdedikasi untuk mencetak engineer handal yang siap kerja.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Menu Navigasi</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#00C9A7]">Beranda</Link></li>
              <li><Link href="/program" className="hover:text-[#00C9A7]">Program Klas</Link></li>
              <li><Link href="/ebooks" className="hover:text-[#00C9A7]">Katalog E-Book</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Informasi Lain</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#00C9A7]">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-[#00C9A7]">Hubungi Kami</Link></li>
              <li><Link href="/syarat-ketentuan" className="text-[#00C9A7]">Syarat & Ketentuan</Link></li>
              <li><Link href="/kebijakan-privasi" className="hover:text-[#00C9A7]">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi. Dev by <a href="https://askaraindonesia.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#00C9A7]">Askara Indonesia</a></p>
        </div>
      </footer>
    </div>
  );
}