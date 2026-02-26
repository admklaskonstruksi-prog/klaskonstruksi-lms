import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Download, Search, ReceiptText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SalesReportPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  const sp = await searchParams;
  const searchQ = sp?.q || "";

  // Tarik data Enrollments (Transaksi) gabung dengan nama profil dan harga kelas
  let { data: transactions } = await supabase
    .from("enrollments")
    .select(`
        created_at,
        profiles ( full_name, id ),
        courses ( title, price )
    `)
    .order("created_at", { ascending: false });

  // Filter pencarian sederhana di level array
  if (searchQ && transactions) {
      transactions = transactions.filter((t: any) => 
          t.courses?.title?.toLowerCase().includes(searchQ.toLowerCase()) || 
          t.profiles?.full_name?.toLowerCase().includes(searchQ.toLowerCase())
      );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Laporan Penjualan</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar transaksi dan histori pendaftaran siswa.</p>
        </div>
        <button className="bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-black transition shadow-lg">
          <Download size={16}/> Ekspor ke CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center">
        <form method="GET" className="relative flex-1 max-w-md">
           <Search size={18} className="absolute left-4 top-3 text-gray-400" />
           <input type="text" name="q" defaultValue={searchQ} placeholder="Cari nama siswa atau kelas..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00C9A7] outline-none" />
           <button type="submit" className="hidden">Cari</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Tanggal Pembelian</th>
              <th className="px-6 py-4">Nama Siswa</th>
              <th className="px-6 py-4">Kelas yang Dibeli</th>
              <th className="px-6 py-4 text-right">Nominal (Rp)</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!transactions || transactions.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada transaksi ditemukan.</td></tr>
            ) : transactions.map((t: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-500 font-medium">
                    {new Date(t.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{t.profiles?.full_name || "Tanpa Nama"}</td>
                <td className="px-6 py-4 text-gray-700">{t.courses?.title || "Kelas Telah Dihapus"}</td>
                <td className="px-6 py-4 text-right font-black text-[#00C9A7]">
                    {t.courses?.price > 0 ? t.courses.price.toLocaleString("id-ID") : "0 (Gratis)"}
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="bg-green-50 text-green-600 font-bold px-2.5 py-1 rounded text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 w-max mx-auto">
                        <ReceiptText size={12}/> Sukses
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}