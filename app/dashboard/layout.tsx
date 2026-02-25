import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const userData = {
    fullName: profile?.full_name || user.email || "Pengguna",
    role: profile?.role || "student",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 4. SEKARANG SUDAH MATCH: Sidebar menerima prop 'user' */}
      <DashboardSidebar user={userData} />

      {/* Perbaikan layout: Sesuaikan margin kiri dengan lebar sidebar (64px = ml-64) */}
      <main className="flex-1 md:ml-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}