import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PieChart, TrendingUp, Activity, Target } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard Analitik</h1>
        <p className="text-gray-500 text-sm mt-1">Wawasan mendalam mengenai performa kelas dan perilaku siswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* CHART 1: KATEGORI TERLARIS (Simulasi Visual Pie Chart dengan CSS Conic Gradient) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><PieChart size={20} className="text-purple-500"/> Distribusi Kategori</h3>
              <div className="flex items-center gap-8">
                  {/* Lingkaran Pie Chart */}
                  <div className="w-32 h-32 rounded-full shadow-inner" style={{ background: "conic-gradient(#00C9A7 0% 45%, #F97316 45% 75%, #3B82F6 75% 100%)" }}></div>
                  <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-[#00C9A7]"></span> Manajemen Proyek</span> <span className="font-bold">45%</span></div>
                      <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-[#F97316]"></span> Desain Struktur</span> <span className="font-bold">30%</span></div>
                      <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Estimasi Biaya</span> <span className="font-bold">25%</span></div>
                  </div>
              </div>
          </div>

          {/* CHART 2: RETENSI SISWA */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><Target size={20} className="text-blue-500"/> Tingkat Penyelesaian Kelas</h3>
              <div className="space-y-5">
                  <div>
                      <div className="flex justify-between text-sm mb-1"><span className="font-bold text-gray-700">Timeline & Scheduling</span> <span className="text-[#00C9A7] font-bold">78% Lulus</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-[#00C9A7] h-2.5 rounded-full" style={{width: '78%'}}></div></div>
                  </div>
                  <div>
                      <div className="flex justify-between text-sm mb-1"><span className="font-bold text-gray-700">Masuk Dunia Proyek</span> <span className="text-[#00C9A7] font-bold">54% Lulus</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-[#00C9A7] h-2.5 rounded-full" style={{width: '54%'}}></div></div>
                  </div>
                  <div>
                      <div className="flex justify-between text-sm mb-1"><span className="font-bold text-gray-700">AutoCAD Lanjut</span> <span className="text-red-500 font-bold">20% Lulus (Drop-off)</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-red-400 h-2.5 rounded-full" style={{width: '20%'}}></div></div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}