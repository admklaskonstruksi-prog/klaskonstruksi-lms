"use client";
export const runtime = 'nodejs';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  MapPin, Phone, Mail, Send, Menu, X, ArrowRight
} from "lucide-react";

export default function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State untuk form input
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });

  // Fungsi untuk mengirim pesan ke WhatsApp
  const handleWhatsAppSubmit = () => {
    const { firstName, lastName, email, message } = formData;
    
    // Validasi sederhana
    if (!firstName || !message) {
      alert("Mohon isi minimal Nama Depan dan Pesan Anda.");
      return;
    }

    // Nomor WA Admin Klas Konstruksi (Gunakan kode negara 62)
    const phoneNumber = "6282120002589"; 

    // Format pesan yang akan dikirim
    const waText = `Halo Tim Klas Konstruksi,\n\nPerkenalkan saya berminat untuk mendaftar sebagai Mentor / bertanya informasi:\n\n*Nama:* ${firstName} ${lastName}\n*Email:* ${email}\n\n*Pesan:* \n${message}`;

    // Encode text untuk URL (mengubah spasi menjadi %20, dll)
    const encodedText = encodeURIComponent(waText);
    
    // Buka link WhatsApp di tab baru
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
              <Link href="/program" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Program Klas
              </Link>
              <Link href="/ebooks" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Katalog E-Book
              </Link>
              <Link href="/#mentor" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Daftar Mentor</Link>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/login?mode=register" className="w-full text-center py-3 bg-[#00C9A7] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- KONTEN KONTAK --- */}
      <main className="max-w-7xl mx-auto py-16 px-6">
        
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Hubungi Kami</h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Tertarik menjadi mentor, punya pertanyaan tentang program, atau butuh konsultasi? Tim kami siap membantu Anda.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Info Kontak */}
            <div className="space-y-8">
                <div className="bg-[#00C9A7] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0"><MapPin /></div>
                                <div>
                                    <p className="font-bold">Kantor Pusat</p>
                                    <p className="text-teal-50 text-sm leading-relaxed">PT. Ardewa Digital Inovasi<br/>Vila Bukit Tidar Blok E4 Astera No. 108<br/>Kota Malang</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Phone /></div>
                                <div>
                                    <p className="font-bold">Telepon / WhatsApp</p>
                                    <p className="text-teal-50 text-sm">0821-2000-2589</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Mail /></div>
                                <div>
                                    <p className="font-bold">Email</p>
                                    <p className="text-teal-50 text-sm">halo@klaskonstruksi.id</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Form Pesan ke WhatsApp */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Daftar Mentor / Kirim Pesan</h3>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Depan <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" 
                              placeholder="Budi" 
                              required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Belakang</label>
                            <input 
                              type="text" 
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" 
                              placeholder="Santoso" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" 
                          placeholder="nama@email.com" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pesan Anda <span className="text-red-500">*</span></label>
                        <textarea 
                          rows={4} 
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" 
                          placeholder="Saya tertarik menjadi mentor untuk bidang struktur. Berikut pengalaman saya..."
                          required
                        ></textarea>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleWhatsAppSubmit}
                      className="w-full py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] transition flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30"
                    >
                        <Send size={18} /> Kirim via WhatsApp
                    </button>
                </form>
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