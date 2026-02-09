import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";

export default async function UsersPage() {
  const supabase = await createClient();

  // Cek Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return redirect("/dashboard");

  // Ambil Data Semua User (Tanpa Email, karena email ada di tabel Auth private)
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
          <p className="text-gray-500">Daftar siswa dan admin terdaftar.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
           Total: {users?.length || 0} User
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nama User</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Bergabung</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {users?.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-sm">
                                    {/* INI YANG TADI ERROR, KITA SUDAH PERBAIKI: */}
                                    {(p.full_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900">
                                    {p.full_name || "Tanpa Nama"}
                                </span>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.role === 'admin' ? 'bg-black text-white' : 'bg-green-100 text-green-700'}`}>
                                {p.role}
                            </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                            {new Date(p.created_at).toLocaleDateString("id-ID")}
                        </td>
                    </tr>
                ))}
                
                {users?.length === 0 && (
                    <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400">
                            Belum ada data pengguna.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}