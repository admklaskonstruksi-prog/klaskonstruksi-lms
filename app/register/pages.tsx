import Link from "next/link";
import { signUp } from "./actions";

// Menggunakan Promise untuk searchParams (Standar Next.js terbaru)
export default async function RegisterPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Bergabung dengan KlasKonstruksi sekarang
          </p>
        </div>
        
        {/* Notifikasi Error jika gagal daftar */}
        {searchParams?.message && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {searchParams.message}
          </div>
        )}

        <form className="mt-8 space-y-6" action={signUp}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                name="fullName"
                type="text"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-colors"
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-colors"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-colors"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#00c49a] hover:bg-[#00a884] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
            >
              Daftar Sekarang
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-[#00c49a] hover:text-[#00a884]">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}