import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Users, Mail, Calendar, Shield } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ManageUsersPage() {
  const supabase = await createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", me?.id)
    .single();

  if (myProfile?.role !== "admin") redirect("/dashboard");

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Gagal memuat data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 mt-1">Daftar pengguna terdaftar di platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Terdaftar
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    Belum ada user.
                  </td>
                </tr>
              ) : (
                profiles?.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                          {(p.full_name || p.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {p.full_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{p.email ?? "—"}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.role || "student"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
