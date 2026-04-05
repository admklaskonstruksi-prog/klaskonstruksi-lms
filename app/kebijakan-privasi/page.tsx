"use client";
export const runtime = 'nodejs';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function PrivacyPolicyPage() {
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

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Beranda</Link>
              <Link href="/program" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Program Klas</Link>
              <Link href="/ebooks" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Katalog E-Book</Link>
              <Link href="/#mentor" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Daftar Mentor</Link>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/login?mode=register" className="w-full text-center py-3 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- KONTEN KEBIJAKAN PRIVASI --- */}
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Kebijakan Privasi</h1>
            <p className="text-gray-500">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-lg text-gray-700 space-y-8 max-w-none">
            <section>
                <p>
                    Selamat datang di <strong>KLAS Konstruksi</strong> (dioperasikan oleh PT. Klas Mahir Konstruksi). Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi yang Anda bagikan kepada kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan informasi Anda saat Anda menggunakan website dan layanan kami.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informasi yang Kami Kumpulkan</h2>
                <p>Kami mengumpulkan informasi dari Anda ketika Anda mendaftar di situs kami, memesan program kelas, atau mengisi formulir. Informasi yang dikumpulkan termasuk namun tidak terbatas pada:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Nama lengkap</li>
                    <li>Alamat email</li>
                    <li>Nomor telepon / WhatsApp</li>
                    <li>Informasi profesional (seperti instansi/universitas dan jabatan)</li>
                    <li>Riwayat transaksi dan akses kelas</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
                <p>Informasi yang kami kumpulkan dari Anda dapat digunakan untuk:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Mempersonalisasi pengalaman Anda dan memenuhi kebutuhan belajar Anda.</li>
                    <li>Memproses transaksi pembayaran kelas atau e-book secara aman.</li>
                    <li>Mengirimkan email berkala mengenai pembaruan kelas, informasi akun, atau layanan pelanggan.</li>
                    <li>Meningkatkan sistem dan tampilan website kami.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Pembayaran dan Pihak Ketiga (Midtrans)</h2>
                <p>
                    Untuk memfasilitasi transaksi yang aman dan nyaman, KLAS Konstruksi menggunakan layanan payment gateway pihak ketiga, yaitu <strong>Midtrans</strong>. 
                </p>
                <p className="mt-2">
                    Saat Anda melakukan pembayaran, informasi pribadi yang relevan (seperti nama, email, nomor telepon, dan nominal tagihan) akan diteruskan ke sistem Midtrans secara terenkripsi untuk keperluan verifikasi dan pemrosesan pembayaran. Kami <strong>tidak pernah</strong> menyimpan data sensitif kartu kredit atau kredensial perbankan Anda di server kami. Semua pemrosesan data keuangan tunduk pada Kebijakan Privasi Midtrans.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Keamanan Data Anda</h2>
                <p>
                    Kami menerapkan berbagai langkah keamanan untuk menjaga keamanan informasi pribadi Anda. Akun Anda dilindungi oleh kata sandi (atau autentikasi Google), dan pertukaran data sensitif antara browser Anda dan situs kami terjadi melalui saluran komunikasi aman bersertifikat SSL (Secure Socket Layer) dan dienkripsi.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Penggunaan Cookies</h2>
                <p>
                    Ya, kami menggunakan cookies. Cookies adalah file kecil yang ditransfer oleh situs atau penyedia layanan ke hard drive komputer Anda melalui browser Web Anda (jika Anda mengizinkannya) yang memungkinkan sistem situs mengenali browser Anda dan mengingat informasi tertentu (seperti sesi login Anda).
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Persetujuan Anda</h2>
                <p>
                    Dengan menggunakan situs kami, Anda menyetujui Kebijakan Privasi situs web kami. Jika Anda tidak setuju dengan kebijakan ini, mohon untuk tidak menggunakan layanan kami.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Hubungi Kami</h2>
                <p>Jika ada pertanyaan mengenai kebijakan privasi ini, Anda dapat menghubungi kami melalui informasi di bawah ini:</p>
                <div className="bg-gray-50 p-6 rounded-xl mt-4 border border-gray-100">
                    <p className="font-bold text-gray-900">PT. Klas Mahir Konstruksi</p>
                    <p className="mt-1">Vila Bukit Tidar Blok E4 Astera No. 108, Kota Malang</p>
                    <p className="mt-1"><strong>Email:</strong> halo@klaskonstruksi.id</p>
                    <p className="mt-1"><strong>WhatsApp:</strong> 0821-2000-2589</p>
                </div>
            </section>
        </div>
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
              <li><Link href="/program" className="hover:text-[#00C9A7] transition-colors">Program Klas</Link></li>
              <li><Link href="/ebooks" className="hover:text-[#00C9A7] transition-colors">Katalog E-Book</Link></li>
              <li><Link href="/#mentor" className="hover:text-[#00C9A7] transition-colors">Daftar Mentor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Informasi Lain</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#00C9A7] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-[#00C9A7] transition-colors">Hubungi Kami</Link></li>
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/kebijakan-privasi" className="hover:text-[#00C9A7] transition-colors text-[#00C9A7]">Kebijakan Privasi</Link></li>
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
             <Link href="https://www.instagram.com/klaskonstruksi" className="hover:text-white transition-colors" target="_blank">Instagram</Link>
             <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
             <Link href="#" className="hover:text-white transition-colors">YouTube</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}