import { createClient } from "@/utils/supabase/server";

export default async function SalesAnalyticsPage() {
  const supabase = await createClient();

  // Fetch Transaksi
  const { data: sales } = await supabase
    .from("enrollments")
    .select(`
        created_at,
        courses (title, price),
        profiles (full_name, email)
    `)
    .order('created_at', { ascending: false });

  // Hitung Total
  const totalRevenue = sales?.reduce((acc, curr: any) => acc + (curr.courses?.price || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100">
            Total Omset: Rp {(totalRevenue / 1000).toLocaleString()}k
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Siswa</th>
                    <th className="px-6 py-4">Item Pembelian</th>
                    <th className="px-6 py-4 text-right">Nilai (IDR)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {sales?.map((sale: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-gray-500">
                            {new Date(sale.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                            {sale.profiles?.full_name}
                            <div className="text-xs text-gray-400 font-normal">{sale.profiles?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                            {sale.courses?.title}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                            Rp {(sale.courses?.price / 1000).toLocaleString()}k
                        </td>
                    </tr>
                ))}
                 {(!sales || sales.length === 0) && (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400">Belum ada transaksi.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}