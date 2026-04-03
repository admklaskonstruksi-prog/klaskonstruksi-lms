export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Globe } from "lucide-react";
import ProfileForm from "./components/ProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isAdmin = profile?.role?.toLowerCase() === "admin";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-sans selection:bg-[#00C9A7] selection:text-white">
        <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900">Pengaturan <span className="text-[#00C9A7]">Akun</span></h1>
            <p className="text-gray-500 mt-2 font-medium">
                {isAdmin ? "Konfigurasi sistem platform Klas Konstruksi." : "Kelola informasi data diri, keamanan, dan preferensi Anda."}
            </p>
        </div>

        {isAdmin ? (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start gap-6">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl shrink-0"><Globe size={32}/></div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-xl">Informasi Platform & Branding</h3>
                        <p className="text-sm text-gray-500 mb-6 mt-1">Ubah nama LMS, logo utama, dan email kontak yang akan dilihat oleh seluruh siswa.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Platform LMS</label>
                                <input type="text" defaultValue="Klas Konstruksi" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#00C9A7] outline-none text-sm bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Support / CS</label>
                                <input type="email" defaultValue="support@klaskonstruksi.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#00C9A7] outline-none text-sm bg-gray-50" />
                            </div>
                        </div>
                        <button className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-black transition shadow-lg mt-2">Simpan Konfigurasi</button>
                    </div>
                </div>
            </div>
        ) : (
            // PANGGIL KOMPONEN CLIENT-SIDE DI SINI
            <ProfileForm profile={profile} user={user} />
        )}
    </div>
  );
}