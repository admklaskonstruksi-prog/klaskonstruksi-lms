export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import AutoLogout from "./components/AutoLogout"; // 1. Import komponen AutoLogout
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // 2. Tambahkan penanganan error pada getUser untuk keamanan ekstra
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Jika tidak ada user atau sesi tidak valid, arahkan ke login
  if (userError || !user) {
    return redirect("/login");
  }

  // Ambil data profil dengan penanganan error
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Opsional: Log error di server jika gagal mengambil profil (kecuali error data tidak ditemukan)
  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Error fetching user profile:", profileError.message);
  }

  const userData = {
    fullName: profile?.full_name || user.email || "Pengguna",
    role: profile?.role || "student",
  };

  return (
    // 3. Bungkus seluruh layout dashboard dengan AutoLogout
    <AutoLogout>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar user={userData} />

        {/* 4. Perbaikan CSS Layout: Gunakan md:ml-64 jika sidebar kamu lebarnya w-64 di desktop */}
        <main className="flex-1 w-full md:ml-64 transition-all duration-300 min-h-screen">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </AutoLogout>
  );
}