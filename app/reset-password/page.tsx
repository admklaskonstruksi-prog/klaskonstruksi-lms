export const runtime = "nodejs";

import Link from "next/link";
import { updatePasswordAction } from "./actions";

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ message?: string }>;
}) {
  const searchParams = await props.searchParams;
  const message = searchParams?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Buat Password Baru</h2>
          <p className="mt-2 text-sm text-gray-500">
            Jika kamu membuka halaman ini tanpa lewat link email reset, prosesnya akan gagal.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
            {message}
          </div>
        )}

        <form className="space-y-4" action={updatePasswordAction}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password Baru</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-colors"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Password</label>
            <input
              name="confirm"
              type="password"
              required
              minLength={6}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition-colors"
              placeholder="Ulangi password"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#00c49a] hover:bg-[#00a884] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Simpan Password
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-sm font-bold text-[#F97316] hover:underline">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}

