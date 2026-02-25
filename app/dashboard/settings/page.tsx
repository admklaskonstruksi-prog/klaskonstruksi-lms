import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { User, Lock, Bell, Camera, ShieldCheck, Mail, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // SERVER ACTION: Fungsi untuk menyimpan perubahan profil ke database
  async function updateProfile(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fullName = formData.get("full_name") as string;
    
    // Update nama di tabel profiles
    await supabase.from("profiles").update({ 
        full_name: fullName,
        updated_at: new Date().toISOString()
    }).eq("id", user.id);

    // Refresh halaman agar perubahan nama langsung terlihat
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-sans">
        <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900">Pengaturan <span className="text-[#00C9A7]">Akun</span></h1>
            <p className="text-gray-500 mt-2 font-medium">Kelola informasi data diri, keamanan, dan preferensi Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AREA KIRI: FORM PROFIL & KEAMANAN */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* CARD 1: PROFIL SAYA */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#00C9A7]">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Profil Saya</h2>
                            <p className="text-sm text-gray-500">Informasi publik dan data diri Anda.</p>
                        </div>
                    </div>

                    <form action={updateProfile} className="space-y-6">
                        {/* Area Foto Profil */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                    {profile?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-gray-300" />
                                    )}
                                </div>
                                <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-[#00C9A7] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#00b596] transition-colors border-2 border-white">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Foto Profil</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-3">Format JPG, PNG max 2MB.</p>
                                <div className="flex gap-2">
                                    <button type="button" className="text-xs font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                                        Unggah Baru
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Area Input Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    name="full_name"
                                    defaultValue={profile?.full_name || ""}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition bg-gray-50 focus:bg-white"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Alamat Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="email" 
                                        defaultValue={user.email}
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00C9A7]" size={18} />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">Email dikunci karena terhubung dengan otentikasi akun.</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button type="submit" className="bg-[#00C9A7] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#00b596] transition-all shadow-lg shadow-[#00C9A7]/20 active:scale-95">
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>

                {/* CARD 2: KEAMANAN */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#F97316]">
                            <Lock size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Keamanan Akun</h2>
                            <p className="text-sm text-gray-500">Amankan akun Anda dengan kata sandi yang kuat.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Kata Sandi</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Disarankan menggunakan minimal 8 karakter</p>
                            </div>
                        </div>
                        <button className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition shadow-sm">
                            Ubah Kata Sandi
                        </button>
                    </div>
                </div>

            </div>

            {/* AREA KANAN: NOTIFIKASI & INFO */}
            <div className="space-y-8">
                
                {/* CARD 3: NOTIFIKASI */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Notifikasi</h2>
                            <p className="text-xs text-gray-500">Atur pengingat & preferensi.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="pr-4">
                                <h4 className="text-sm font-bold text-gray-900">Pengingat Belajar</h4>
                                <p className="text-[11px] text-gray-500 mt-1">Kirim email jika saya belum belajar selama 3 hari.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C9A7]"></div>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="pr-4">
                                <h4 className="text-sm font-bold text-gray-900">Info & Promo Terbaru</h4>
                                <p className="text-[11px] text-gray-500 mt-1">Dapatkan info diskon kelas dan update fitur baru.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C9A7]"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* INFO AKUN */}
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Informasi Tambahan</h3>
                    <ul className="space-y-3 text-xs font-medium text-gray-500">
                        <li className="flex justify-between items-center border-b border-gray-200 pb-3">
                            <span>Role Akun</span>
                            <span className="font-bold text-gray-900 capitalize bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{profile?.role || "Student"}</span>
                        </li>
                        <li className="flex justify-between items-center pt-1">
                            <span>Bergabung Sejak</span>
                            <span className="font-bold text-gray-900">
                                {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    </div>
  );
}