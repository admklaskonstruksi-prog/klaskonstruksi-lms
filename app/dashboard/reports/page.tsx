import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Download, FileText, Filter } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pusat Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Unduh data historis pendaftaran dan transaksi platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Laporan Transaksi */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><FileText size={24}/></div>
              <h3 className="text-lg font-bold text-gray-900">Laporan Transaksi</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">Seluruh data pembelian kelas, status pembayaran (sukses/gagal), dan metode bayar.</p>
              
              <div className="mt-auto flex gap-2">
                  <button className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-lg text-sm flex justify-center items-center gap-2 hover:bg-black transition"><Download size={16}/> Ekspor CSV</button>
              </div>
          </div>

          {/* Laporan Pendaftaran Siswa */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><FileText size={24}/></div>
              <h3 className="text-lg font-bold text-gray-900">Laporan Siswa & Pendaftaran</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">Data siapa saja yang mendaftar ke kelas mana, beserta tanggal bergabung.</p>
              
              <div className="mt-auto flex gap-2">
                  <button className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-lg text-sm flex justify-center items-center gap-2 hover:bg-black transition"><Download size={16}/> Ekspor CSV</button>
              </div>
          </div>

          {/* Laporan Performa Kelas */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4"><FileText size={24}/></div>
              <h3 className="text-lg font-bold text-gray-900">Laporan Progres Belajar</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">Lacak siswa mana yang berhenti di tengah jalan (drop-off) dan yang telah lulus.</p>
              
              <div className="mt-auto flex gap-2">
                  <button className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-lg text-sm flex justify-center items-center gap-2 hover:bg-gray-50 transition"><Filter size={16}/> Pilih Kelas</button>
              </div>
          </div>

      </div>
    </div>
  );
}