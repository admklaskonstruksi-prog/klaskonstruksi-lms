import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  MapPin, Phone, Mail, Instagram, Linkedin, Youtube, 
  Send
} from "lucide-react";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-gray-900">
               KLAS<span className="text-[#00C9A7]">Konstruksi</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-sm font-bold text-gray-600 hover:text-[#00C9A7] transition">
                    Beranda
                </Link>
                <Link href="/#courses" className="text-sm font-bold text-gray-600 hover:text-[#00C9A7] transition">
                    Jelajah Kelas
                </Link>
                <Link href="/about" className="text-sm font-bold text-gray-600 hover:text-[#00C9A7] transition">
                    Tentang Kami
                </Link>
                <Link href="/contact" className="text-sm font-bold text-[#00C9A7] transition">
                    Kontak
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <Link href="/dashboard" className="px-5 py-2.5 bg-[#00C9A7] text-white text-sm font-bold rounded-xl hover:bg-[#00b894] transition shadow-md shadow-green-200">
                        Dashboard Saya
                    </Link>
                ) : (
                    <>
                        <Link href="/login" className="hidden md:block text-sm font-bold text-gray-600 hover:text-[#00C9A7]">
                            Masuk
                        </Link>
                        <Link href="/login" className="px-5 py-2.5 bg-[#00C9A7] text-white text-sm font-bold rounded-xl hover:bg-[#00b894] transition shadow-md shadow-green-200">
                            Daftar / Masuk
                        </Link>
                    </>
                )}
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-16 px-6">
        
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Hubungi Kami</h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Punya pertanyaan tentang program belajar atau butuh konsultasi? Tim kami siap membantu Anda.
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
                                    <p className="text-green-50 text-sm leading-relaxed">Gedung Konstruksi Center Lt. 3,<br/> Jl. Jendral Sudirman Kav 50,<br/> Jakarta Selatan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Phone /></div>
                                <div>
                                    <p className="font-bold">Telepon / WhatsApp</p>
                                    <p className="text-green-50 text-sm">+62 812-3456-7890</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Mail /></div>
                                <div>
                                    <p className="font-bold">Email</p>
                                    <p className="text-green-50 text-sm">halo@klaskonstruksi.id</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-gray-100 rounded-3xl h-64 w-full flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                    GOOGLE MAPS AREA
                </div>
            </div>

            {/* Form Pesan */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h3>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Depan</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" placeholder="Budi" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Belakang</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" placeholder="Santoso" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" placeholder="nama@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pesan Anda</label>
                        <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]" placeholder="Tulis pesan atau pertanyaan Anda disini..."></textarea>
                    </div>
                    <button type="button" className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2">
                        <Send size={18} /> Kirim Pesan
                    </button>
                </form>
            </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-12">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-gray-900 mb-6">
                        KLAS<span className="text-[#00C9A7]">Konstruksi</span>
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Platform edukasi konstruksi berbasis proyek pertama di Indonesia.
                    </p>
                </div>
                <div className="col-span-1 md:col-span-1">
                    <h4 className="font-bold text-gray-900 mb-6">Hubungi Kami</h4>
                    <ul className="space-y-4 text-sm text-gray-600">
                        <li className="flex items-start gap-3"><MapPin className="text-[#00C9A7] shrink-0" size={18} /><span>Gedung Konstruksi Center Lt. 3,<br/> Jl. Jendral Sudirman Kav 50</span></li>
                        <li className="flex items-center gap-3"><Phone className="text-[#00C9A7] shrink-0" size={18} /><span>+62 812-3456-7890</span></li>
                        <li className="flex items-center gap-3"><Mail className="text-[#00C9A7] shrink-0" size={18} /><span>halo@klaskonstruksi.id</span></li>
                    </ul>
                </div>
                <div className="col-span-1 md:col-span-1">
                    <h4 className="font-bold text-gray-900 mb-6">Social Media</h4>
                    <div className="flex gap-4">
                        <SocialButton icon={Instagram} />
                        <SocialButton icon={Linkedin} />
                        <SocialButton icon={Youtube} />
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">&copy; 2026 KlasKonstruksi Indonesia. All rights reserved.</div>
         </div>
      </footer>
    </div>
  );
}

function SocialButton({ icon: Icon }: any) {
    return (
        <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#00C9A7] hover:text-white transition"><Icon size={18} /></a>
    )
}