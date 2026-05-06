export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import AutoLogout from "./components/AutoLogout"; 
import KlasAIWidget from "./components/KlasAIWidget";
// 1. IMPORT ACTIVITY TRACKER DI SINI
import ActivityTracker from "./components/ActivityTracker";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Error fetching user profile:", profileError.message);
  }

  const userData = {
    fullName: profile?.full_name || user.email || "Pengguna",
    role: profile?.role || "student",
  };

  return (
    <AutoLogout>
      {/* 2. PASANG SENSOR PELACAK AKTIVITAS (TIDAK TERLIHAT DI LAYAR) */}
      <ActivityTracker userId={user.id} />

      {/* UBAH: flex-col untuk HP, md:flex-row untuk Desktop */}
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
        <DashboardSidebar user={userData} />

        <main className="flex-1 min-w-0 transition-all duration-300 flex flex-col">
          {children}
        </main>
        
        <KlasAIWidget />
      </div>
    </AutoLogout>
  );
}