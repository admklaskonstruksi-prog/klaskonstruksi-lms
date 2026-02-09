import { createClient } from "@/utils/supabase/server";
import { AlertCircle, User, BookOpen, Calendar } from "lucide-react";

export const dynamic = "force-dynamic"; 

export default async function UserAnalyticsPage() {
  const supabase = await createClient();

  // 1. Fetch User Data
  // REVISI: Menghapus 'email' dari select karena kolomnya tidak ada di tabel profiles
  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
        id,
        full_name, 
        role,
        created_at,
        enrollments (
            status, 
            progress, 
            courses (title)
        )
    `)
    .neq('role', 'admin') // Filter agar admin tidak muncul
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching users details:", error.message);
    return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center">
            <AlertCircle className="mb-2" />
            <p className="font-bold">Gagal memuat data pengguna.</p>
            <p className="text-xs mt-1 font-mono">{error.message}</p>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Analitik Pengguna</h1>
            <p className="text-gray-500 text-sm mt-1">Pantau perkembangan belajar dan aktivitas pengguna.</p>
        </div>
        <div className="bg-green-50 text-green-700 px-5 py-2.5 rounded-xl font-bold border border-green-100 text-sm flex items-center gap-2 shadow-sm">
            <User size={18} />
            Total: {users?.length || 0} Pengguna
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 min-w-[200px]">Nama Pengguna</th>
                        <th className="px-6 py-4 min-w-[250px]">Kelas Diambil</th>
                        <th className="px-6 py-4 min-w-[200px]">Progress Belajar</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users?.map((user: any, idx: number) => (
                        <tr key={user.id || idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 align-top">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#00C9A7]/10 text-[#00C9A7] flex items-center justify-center font-bold text-sm uppercase border border-[#00C9A7]/20">
                                        {user.full_name ? user.full_name.charAt(0) : "U"}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 capitalize text-base">
                                            {user.full_name || "Tanpa Nama"}
                                        </div>
                                        {/* Email dihapus dari tampilan karena datanya tidak diambil */}
                                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <Calendar size={10} />
                                            Gabung: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                {user.enrollments && user.enrollments.length > 0 ? (
                                    <div className="space-y-2">
                                        {user.enrollments.map((e: any, i:number) => (
                                            <div key={i} className="text-xs text-gray-700 flex items-start gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <BookOpen size={14} className="text-[#00C9A7] mt-0.5 shrink-0" />
                                                <span className="leading-snug font-medium">
                                                    {e.courses?.title || "Judul tidak tersedia"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic text-xs bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Belum ada kelas</span>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top">
                                {user.enrollments && user.enrollments.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.enrollments.map((e: any, i:number) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-[10px] mb-1 font-bold text-gray-500">
                                                    <span>Progress</span>
                                                    <span>{e.progress || 0}%</span>
                                                </div>
                                                <div className="w-full max-w-[150px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#00C9A7] rounded-full transition-all duration-500" 
                                                        style={{width: `${e.progress || 0}%`}}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-300 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                    Aktif
                                </span>
                            </td>
                        </tr>
                    ))}
                    
                    {(!users || users.length === 0) && (
                        <tr>
                            <td colSpan={4} className="p-16 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <User className="w-8 h-8 opacity-20" />
                                    </div>
                                    <span className="text-lg font-bold text-gray-600">Belum ada pengguna</span>
                                    <span className="text-sm mt-1">Data pengguna yang mendaftar akan muncul di sini.</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}