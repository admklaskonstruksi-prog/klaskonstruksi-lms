"use client";

import { useState } from "react";
import { User, Camera, Mail, CheckCircle2, ShieldCheck, Bell, Loader2, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileForm({ profile, user }: { profile: any, user: any }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  
  // Asumsikan kita menggunakan kolom 'send_reminder' di tabel profiles (jika belum ada, Anda perlu menambahkannya di database)
  const [sendReminder, setSendReminder] = useState(profile?.send_reminder !== false); 

  // --- FUNGSI UPLOAD FOTO PROFIL ---
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB!");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah foto...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload ke Supabase Storage (Pastikan bucket 'avatars' sudah ada dan public!)
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Simpan URL baru ke tabel profiles
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Foto profil berhasil diperbarui!", { id: toastId });
      router.refresh();

    } catch (error: any) {
      toast.error(`Gagal mengunggah foto: ${error.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // --- FUNGSI SIMPAN PROFIL ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Menyimpan data...");

    try {
      const formData = new FormData(e.currentTarget);
      const updates = {
        full_name: formData.get("full_name") as string,
        phone: formData.get("phone") as string,
        country: formData.get("country") as string,
        province: formData.get("province") as string,
        city: formData.get("city") as string,
        address: formData.get("address") as string,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;

      toast.success("Profil berhasil diperbarui!", { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(`Gagal menyimpan: ${error.message}`, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // --- FUNGSI TOGGLE PENGINGAT ---
  const toggleReminder = async () => {
    const newValue = !sendReminder;
    setSendReminder(newValue); // Optimistic UI update

    try {
      // Menyimpan preferensi notifikasi ke database
      await supabase.from("profiles").update({ send_reminder: newValue }).eq("id", user.id);
      toast.success(newValue ? "Pengingat belajar diaktifkan!" : "Pengingat belajar dimatikan.");
    } catch (error) {
      setSendReminder(!newValue); // Rollback jika gagal
      toast.error("Gagal mengubah pengaturan notifikasi.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
          
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

              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleUploadPhoto}
                            disabled={isUploading}
                          />
                          <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                              {isUploading ? (
                                <Loader2 size={32} className="animate-spin text-[#00C9A7]" />
                              ) : avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User size={40} className="text-gray-300" />
                              )}
                              
                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                              </div>
                          </div>
                          <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-[#00C9A7] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#00b596] transition-colors border-2 border-white z-20 pointer-events-none">
                              <Camera size={14} />
                          </button>
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-900 text-sm">Foto Profil</h3>
                          <p className="text-xs text-gray-500 mt-1 mb-3">Format JPG, PNG max 2MB.</p>
                          <div className="text-xs font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg inline-block hover:bg-gray-200 transition">
                            {isUploading ? "Mengunggah..." : "Pilih Foto Baru"}
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                          <input type="text" name="full_name" defaultValue={profile?.full_name || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition bg-gray-50 focus:bg-white" required />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">No. WhatsApp</label>
                          <input type="tel" name="phone" defaultValue={profile?.phone || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition bg-gray-50 focus:bg-white" required placeholder="0812..." />
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Negara</label>
                          <input type="text" name="country" defaultValue={profile?.country || "Indonesia"} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition bg-gray-50 focus:bg-white" required />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Provinsi</label>
                          <input type="text" name="province" defaultValue={profile?.province || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition bg-gray-50 focus:bg-white" required />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">Kota / Kabupaten</label>
                          <input type="text" name="city" defaultValue={profile?.city || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition bg-gray-50 focus:bg-white" required />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">Detail Alamat</label>
                          <textarea name="address" defaultValue={profile?.address || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition bg-gray-50 focus:bg-white" required rows={2} placeholder="Jalan, RT/RW, No. Rumah"></textarea>
                      </div>

                      <div className="space-y-2 md:col-span-2 mt-2">
                          <label className="text-sm font-bold text-gray-700">Alamat Email</label>
                          <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input type="email" defaultValue={user.email} disabled className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00C9A7]" size={18} />
                          </div>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button type="submit" disabled={isSaving} className="bg-[#00C9A7] disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl hover:bg-[#00b596] transition-all shadow-lg shadow-[#00C9A7]/20 active:scale-95 flex items-center gap-2">
                        {isSaving ? <Loader2 size={18} className="animate-spin"/> : null}
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                  </div>
              </form>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#F97316]"><Lock size={20} /></div>
                  <div>
                      <h2 className="text-xl font-bold text-gray-900">Keamanan Akun</h2>
                      <p className="text-sm text-gray-500">Amankan akun Anda dengan kata sandi yang kuat.</p>
                  </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400"><ShieldCheck size={24} /></div>
                      <div>
                          <h3 className="font-bold text-gray-900">Kata Sandi</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Disarankan menggunakan minimal 8 karakter</p>
                      </div>
                  </div>
                  <button className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition shadow-sm">Ubah Kata Sandi</button>
              </div>
          </div>
      </div>

      <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Bell size={20} /></div>
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
                      <button 
                        onClick={toggleReminder}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${sendReminder ? 'bg-[#00C9A7]' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendReminder ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
              </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Informasi Tambahan</h3>
              <ul className="space-y-3 text-xs font-medium text-gray-500">
                  <li className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <span>Role Akun</span>
                      <span className="font-bold text-gray-900 capitalize bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{profile?.role || "Student"}</span>
                  </li>
                  <li className="flex justify-between items-center pt-1">
                      <span>Bergabung Sejak</span>
                      <span className="font-bold text-gray-900">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </li>
              </ul>
          </div>
      </div>
    </div>
  );
}