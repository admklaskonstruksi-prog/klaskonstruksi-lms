"use client";
export const runtime = 'nodejs';

import { useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import {
  signInAction,
  signUpAction,
  signInWithGoogleFromSite,
  requestPasswordResetAction,
} from "./actions";
import { Loader2, Chrome, Eye, EyeOff } from "lucide-react";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false, loading: () => <div className="h-[400px] w-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-[#F97316] w-8 h-8" /></div> }
);

function PasswordResetModal(props: {
  open: boolean;
  onClose: () => void;
  email: string;
  setEmail: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-900">Reset Password</h3>
          <p className="text-sm text-gray-500 mt-1">Masukkan email akun kamu. Kami kirim link untuk buat password baru.</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={props.email}
              onChange={(e) => props.setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={props.onClose}
              className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
              disabled={props.isPending}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={props.onSubmit}
              disabled={props.isPending || !props.email.trim()}
              className="flex-1 bg-[#F97316] text-white font-bold py-3 rounded-xl hover:bg-[#ea580c] transition shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {props.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Kirim Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    }>
      <LoginPageShell />
    </Suspense>
  );
}

function LoginPageShell() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State untuk konfirmasi password
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetPending, startResetTransition] = useTransition();

  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setIsRegister(true);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    const formData = new FormData(e.currentTarget);
    
    // Validasi Confirm Password saat Mendaftar
    if (isRegister) {
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirm_password") as string;
        
        if (password !== confirmPassword) {
            setErrorMsg("Password dan Konfirmasi Password tidak cocok.");
            return;
        }
    }

    formData.append("callbackUrl", callbackUrl);
    formData.append("siteUrl", window.location.origin);

    startTransition(async () => {
      if (isRegister) {
        // Hapus field confirm_password sebelum dikirim ke backend jika backend tidak membutuhkannya
        // formData.delete("confirm_password"); 

        const res = await signUpAction(formData);
        if (res?.error) setErrorMsg(res.error);
        if (res?.success) {
          setSuccessMsg(res.success);
          setIsRegister(false);
        }
      } else {
        const res = await signInAction(formData);
        if (res?.error) setErrorMsg(res.error);
        if (res?.success && res?.redirectUrl) {
          router.push(res.redirectUrl);
          router.refresh();
        }
      }
    });
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    const res = await signInWithGoogleFromSite(callbackUrl, window.location.origin);
    if (res?.error) setErrorMsg(res.error);
    if (res?.success && res?.url) window.location.href = res.url;
  };

  const handlePasswordReset = () => {
    setErrorMsg("");
    setSuccessMsg("");
    startResetTransition(async () => {
      const fd = new FormData();
      fd.append("email", resetEmail);
      fd.append("siteUrl", window.location.origin);
      const res = await requestPasswordResetAction(fd);
      if (res?.error) setErrorMsg(res.error);
      if (res?.success) {
        setSuccessMsg(res.success);
        setIsResetOpen(false);
      }
    });
  };

  return (
    <>
      <PasswordResetModal
        open={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        email={resetEmail}
        setEmail={setResetEmail}
        onSubmit={handlePasswordReset}
        isPending={isResetPending}
      />

      <div className="flex min-h-screen bg-white font-sans">
        <div className="hidden lg:flex w-1/2 bg-orange-50 p-12 flex-col justify-center items-center relative overflow-hidden border-r border-orange-100">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

          <div className="z-10 text-center max-w-md mt-10">
            <h1 className="text-4xl lg:text-5xl font-black text-[#F97316] mb-6 leading-tight tracking-tight">
              Bangun Masa Depanmu.
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Bergabunglah dengan ribuan profesional konstruksi lainnya. Pelajari skill teknis dari RAB hingga Manajemen Proyek dalam satu platform.
            </p>
          </div>

          <div className="z-10 w-full max-w-lg mt-8 flex justify-center">
            <LottiePlayer autoplay loop src="/animasi-pekerja.json" style={{ height: "400px", width: "400px" }} />
          </div>
        </div>

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

            {errorMsg && (
              <div className="p-3 mb-6 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 mb-6 bg-green-50 text-green-600 text-sm font-bold rounded-xl border border-green-100">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAMA - Hanya muncul saat Register */}
              {isRegister && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder="Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white"
                  />
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetOpen(true);
                        setResetEmail("");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-xs font-bold text-[#F97316] hover:underline"
                    >
                      Lupa Password?
                    </button>
                  )}
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

              {/* KONFIRMASI PASSWORD - Hanya muncul saat Register */}
              {isRegister && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      required
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#F97316] text-white font-bold py-3.5 rounded-xl hover:bg-[#ea580c] transition shadow-lg shadow-[#F97316]/30 flex items-center justify-center gap-2 mt-6"
              >
                {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : isRegister ? "Daftar Sekarang" : "Masuk"}
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Atau lanjutkan dengan</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition flex items-center justify-center gap-3"
            >
              <Chrome className="text-blue-500" size={20} /> Google
            </button>

            <p className="text-center mt-8 text-sm font-medium text-gray-600">
              {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg("");
                  setSuccessMsg("");
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="text-[#F97316] font-bold ml-2 hover:underline"
              >
                {isRegister ? "Masuk di sini" : "Daftar Baru"}
              </button>
            </p>

            <p className="text-center mt-12 text-xs text-gray-400 font-medium">© 2026 KlasKonstruksi V2. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}