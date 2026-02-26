import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Search, ShieldAlert, UserCheck } from "lucide-react";
import UserActions from "./components/UserActions";

export const dynamic = "force-dynamic";

export default async function UserManagementPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  const sp = await searchParams;
  const searchQ = sp?.q || "";

  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (searchQ) query = query.ilike("full_name", `%${searchQ}%`);
  
  const { data: users } = await query;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Kelola Pengguna</h1>
        <p className="text-gray-500 text-sm mt-1">Manajemen data siswa dan hak akses administrator.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center">
        <form method="GET" className="relative flex-1 max-w-md">
           <Search size={18} className="absolute left-4 top-3 text-gray-400" />
           <input type="text" name="q" defaultValue={searchQ} placeholder="Cari nama pengguna..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00C9A7] outline-none" />
           <button type="submit" className="hidden">Cari</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Nama Pengguna</th>
              <th className="px-6 py-4">Role Akses</th>
              <th className="px-6 py-4">Status Onboarding</th>
              <th className="px-6 py-4">Tanggal Bergabung</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{u.full_name || "Tanpa Nama"}</td>
                <td className="px-6 py-4">
                  {u.role?.toLowerCase() === 'admin' ? (
                    <span className="bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1.5 w-max"><ShieldAlert size={14}/> Admin</span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1.5 w-max"><UserCheck size={14}/> Siswa</span>
                  )}
                </td>
                <td className="px-6 py-4">
                    {u.onboarding_completed ? <span className="text-green-600 font-medium text-xs">Selesai</span> : <span className="text-gray-400 font-medium text-xs">Belum</span>}
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                <td className="px-6 py-4">
                   {/* Tombol aksi dipanggil di sini agar interaktif */}
                   <UserActions user={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}