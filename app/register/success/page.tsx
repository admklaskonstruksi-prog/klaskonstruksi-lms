import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
        
        {/* Ikon Surat */}
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00c49a]">
          <MailCheck size={48} />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Cek Email Anda!
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed text-sm">
          Pendaftaran berhasil! Kami telah mengirimkan link verifikasi ke email yang Anda daftarkan. 
          <br /><br />
          <strong className="text-gray-900 font-semibold bg-yellow-50 px-2 py-1 rounded">
            Silakan buka Kotak Masuk (atau folder Spam)
          </strong> 
          <br /> dan klik link tersebut untuk mengaktifkan akun Anda sebelum bisa masuk.
        </p>

        <Link 
          href="/login" 
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#00c49a] hover:bg-[#00a884] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          Ke Halaman Masuk
        </Link>
      </div>
    </div>
  );
}