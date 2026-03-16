export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import AutoLogout from "./components/AutoLogout"; 
import KlasAIWidget from "./components/KlasAIWidget"; // <-- IMPORT KLAS AI WIDGET
import { ReactNode } from "react";
import { revalidatePath } from "next/cache";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect("/login");
  }

  // Mengambil SEMUA field profile untuk pengecekan kelengkapan
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Error fetching user profile:", profileError.message);
  }

  const userData = {
    fullName: profile?.full_name || user.email || "Pengguna",
    role: profile?.role || "student",
  };

  const isAdmin = profile?.role?.toLowerCase() === 'admin';
  
  // Logika pemblokiran dipindah ke Layout
  const isProfileIncomplete = !isAdmin && (!profile?.phone || !profile?.address || !profile?.country || !profile?.province || !profile?.city);

  async function saveMissingProfile(formData: FormData) {
    "use server";
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    await supabaseClient.from("profiles").update({
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      country: formData.get("country") as string,
      province: formData.get("province") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
    }).eq("id", user.id);

    // Revalidate tipe layout agar modal langsung tertutup di semua halaman
    revalidatePath("/dashboard", "layout"); 
  }

  return (
    <AutoLogout>
      <div className="flex min-h-screen bg-gray-50 relative">
        <DashboardSidebar user={userData} />

        <main className="flex-1 min-w-0 transition-all duration-300 min-h-screen">
          {children}
        </main>
        
        {/* FITUR CHAT AI DITAMBAHKAN DI SINI */}
        <KlasAIWidget />
        
        {/* MODAL PENCEGAT (Sekarang mengunci seluruh aplikasi dashboard) */}
        {isProfileIncomplete && (
          <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
              <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-2xl border border-gray-100 my-auto">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Lengkapi Data Diri</h2>
                  <p className="text-gray-500 text-sm mb-6">Sebelum mulai belajar, lengkapi profil Anda untuk keperluan sertifikat dan keamanan.</p>
                  
                  <form action={saveMissingProfile} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                          <input type="text" name="full_name" defaultValue={profile?.full_name || user.user_metadata?.full_name || ""} required placeholder="Budi Santoso" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white text-sm" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp</label>
                          <input type="tel" name="phone" defaultValue={profile?.phone || ""} required placeholder="0812xxxxxx" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white text-sm" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Negara</label>
                              <input type="text" name="country" defaultValue={profile?.country || "Indonesia"} required placeholder="Indonesia" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white text-sm" />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Provinsi</label>
                              <input type="text" name="province" defaultValue={profile?.province || ""} required placeholder="Jawa Timur" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white text-sm" />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                              <label className="block text-sm font-bold text-gray-700 mb-1">Kota / Kabupaten</label>
                              <input type="text" name="city" defaultValue={profile?.city || ""} required placeholder="Malang" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white text-sm" />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Detail Alamat (Jalan/No. Rumah)</label>
                          <textarea name="address" defaultValue={profile?.address || ""} required placeholder="Jl. Raya No. 123..." rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-gray-50 focus:bg-white text-sm"></textarea>
                      </div>

                      <button type="submit" className="w-full bg-[#F97316] text-white font-bold py-3.5 rounded-xl hover:bg-[#ea580c] transition mt-4 shadow-lg shadow-[#F97316]/20">Simpan & Lanjutkan</button>
                  </form>
              </div>
          </div>
        )}
      </div>
    </AutoLogout>
  );
}