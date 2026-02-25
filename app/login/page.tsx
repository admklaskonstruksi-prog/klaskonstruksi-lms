import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; redirect?: string }>;
}) {
  // 1. SOLUSI ERROR: Await searchParams untuk Next.js 15
  const sp = await searchParams;
  const message = sp?.message;
  
  // 2. Tangkap URL tujuan jika user diarahkan dari halaman checkout
  const redirectUrl = sp?.redirect || "/dashboard";

  const signIn = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nextUrl = formData.get("redirectUrl") as string; // Ambil tujuan dari form
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Login Gagal: " + error.message);
    }

    // Arahkan kembali ke halaman kelas yang tadi mau dibeli
    return redirect(nextUrl);
  };

  const signUp = async (formData: FormData) => {
    "use server";
    const origin = (await headers()).get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
            full_name: email.split("@")[0], 
        }
      },
    });

    if (error) {
      return redirect("/login?message=Daftar Gagal: " + error.message);
    }

    return redirect("/login?message=Cek email Anda untuk konfirmasi pendaftaran.");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans selection:bg-[#F97316] selection:text-white">
      
      {/* Kolom Kiri: Image/Branding (Warna Disamakan ke Orange) */}
      <div className="hidden md:flex md:w-1/2 bg-[#F97316] items-center justify-center p-12 relative overflow-hidden">
         {/* Menggunakan URL gambar permanen dari picsum */}
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/id/1040/1000/1000')] bg-cover bg-center opacity-20 mix-blend-multiply"></div>
         <div className="relative z-10 text-white max-w-lg">
            <h2 className="text-4xl font-bold mb-6">Bangun Masa Depanmu.</h2>
            <p className="text-lg opacity-90">
                Bergabunglah dengan ribuan profesional konstruksi lainnya. Pelajari skill teknis dari RAB hingga Manajemen Proyek dalam satu platform.
            </p>
         </div>
      </div>

      {/* Kolom Kanan: Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <Link href="/" className="absolute top-8 right-8 flex items-center gap-2 text-gray-400 hover:text-[#F97316] transition">
            <ArrowLeft size={16} /> Kembali ke Home
        </Link>

        <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
                <p className="text-gray-500 text-sm mt-2">Masuk atau daftar untuk mulai belajar.</p>
            </div>

            {message && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                    <Lock size={16} /> {message}
                </div>
            )}

            <form className="space-y-5">
                {/* Input Hidden untuk menangkap URL redirect */}
                <input type="hidden" name="redirectUrl" value={redirectUrl} />
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition"
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        formAction={signIn}
                        className="flex-1 py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition shadow-lg shadow-orange-500/30"
                    >
                        Masuk
                    </button>
                    <button
                        formAction={signUp}
                        className="flex-1 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                    >
                        Daftar Baru
                    </button>
                </div>
            </form>
            
            <p className="text-center text-xs text-gray-400 mt-6">
                &copy; {new Date().getFullYear()} KlasKonstruksi V2. All rights reserved.
            </p>
        </div>
      </div>
    </div>
  );
}