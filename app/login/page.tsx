"use client";

import { useState, useTransition } from "react";
import { signInAction, signUpAction, signInWithGoogle } from "./actions";
import { Loader2, Chrome, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  
  // STATE BARU UNTUK TOGGLE PASSWORD
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (isRegister) {
        const res = await signUpAction(formData);
        if (res?.error) setErrorMsg(res.error);
        if (res?.success) {
            setSuccessMsg(res.success);
            setIsRegister(false); // Balikkan ke form login setelah sukses daftar
            e.currentTarget.reset();
        }
      } else {
        const res = await signInAction(formData);
        if (res?.error) setErrorMsg(res.error);
      }
    });
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    const res = await signInWithGoogle();
    if (res?.error) setErrorMsg(res.error);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* BAGIAN KIRI: GAMBAR & BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#F97316] to-[#ea580c] relative p-12 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 opacity-20">
             <Image src="https://images.unsplash.com/photo-1541888081696-6b2210a40d58?q=80&w=2000&auto=format&fit=crop" alt="Bg" fill className="object-cover" />
        </div>
        
        <div className="relative z-10 text-white max-w-lg">
            <h1 className="text-5xl font-black mb-6 leading-tight">Bangun Masa Depanmu.</h1>
            <p className="text-lg text-white/90 leading-relaxed">
                Bergabunglah dengan ribuan profesional konstruksi lainnya. Pelajari skill teknis dari RAB hingga Manajemen Proyek dalam satu platform.
            </p>
        </div>
      </div>

      {/* BAGIAN KANAN: FORM DINAMIS */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
          <div className="w-full max-w-md">
              <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                      {isRegister ? "Daftar Akun Baru" : "Selamat Datang"}
                  </h2>
                  <p className="text-gray-500 text-sm">
                      {isRegister ? "Lengkapi data diri Anda di bawah ini." : "Masuk atau daftar untuk mulai belajar."}
                  </p>
              </div>

              {/* Tampilkan Notifikasi Error/Sukses */}
              {errorMsg && <div className="p-3 mb-6 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{errorMsg}</div>}
              {successMsg && <div className="p-3 mb-6 bg-green-50 text-green-600 text-sm font-bold rounded-xl border border-green-100">{successMsg}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                  {/* INPUT KHUSUS REGISTER */}
                  {isRegister && (
                      <>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                              <input type="text" name="full_name" required placeholder="Budi Santoso" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp</label>
                                  <input type="tel" name="phone" required placeholder="0812..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Kota / Domisili</label>
                                  <input type="text" name="address" required placeholder="Jakarta" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white" />
                              </div>
                          </div>
                      </>
                  )}

                  {/* INPUT UMUM (EMAIL) */}
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                      <input type="email" name="email" required placeholder="nama@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white" />
                  </div>
                  
                  {/* INPUT PASSWORD DENGAN IKON MATA */}
                  <div>
                      <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-bold text-gray-700">Password</label>
                          {!isRegister && <button type="button" className="text-xs font-bold text-[#F97316] hover:underline">Lupa Password?</button>}
                      </div>
                      <div className="relative">
                          <input 
                              type={showPassword ? "text" : "password"} 
                              name="password" 
                              required 
                              placeholder="••••••••" 
                              minLength={6} 
                              className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white" 
                          />
                          <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                          >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                      </div>
                  </div>

                  {/* TOMBOL SUBMIT */}
                  <button type="submit" disabled={isPending} className="w-full bg-[#F97316] text-white font-bold py-3.5 rounded-xl hover:bg-[#ea580c] transition shadow-lg shadow-[#F97316]/30 flex items-center justify-center gap-2 mt-6">
                      {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegister ? "Daftar Sekarang" : "Masuk")}
                  </button>
              </form>

              {/* SEPARATOR */}
              <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Atau lanjutkan dengan</span>
                  <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* LOGIN GOOGLE */}
              <button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition flex items-center justify-center gap-3"
              >
                  <Chrome className="text-blue-500" size={20} /> Google
              </button>

              {/* TOGGLE LOGIN / REGISTER */}
              <p className="text-center mt-8 text-sm font-medium text-gray-600">
                  {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}
                  <button 
                      onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); setSuccessMsg(""); setShowPassword(false); }} 
                      className="text-[#F97316] font-bold ml-2 hover:underline"
                  >
                      {isRegister ? "Masuk di sini" : "Daftar Baru"}
                  </button>
              </p>

              <p className="text-center mt-12 text-xs text-gray-400 font-medium">
                  © 2026 KlasKonstruksi V2. All rights reserved.
              </p>
          </div>
      </div>

    </div>
  );
}