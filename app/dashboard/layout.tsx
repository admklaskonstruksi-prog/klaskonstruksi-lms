import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar"; // Pastikan path ini sesuai lokasi file sidebar Anda
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // 1. Cek User Login (Auth)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Ambil Detail Profil (Role & Nama Lengkap) dari Tabel 'profiles'
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // 3. Siapkan data untuk dikirim ke Sidebar
  // Jika profile belum lengkap, kita pakai default value biar gak error
  const userData = {
    fullName: profile?.full_name || user.email || "Pengguna",
    role: profile?.role || "student",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR (Client Component) */}
      {/* Kita kirim data user dari Server ke sini */}
      <DashboardSidebar user={userData} />

      {/* KONTEN UTAMA */}
      <main className="flex-1 md:ml-72 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}