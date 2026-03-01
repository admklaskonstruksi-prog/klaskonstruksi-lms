import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Wallet, TrendingUp, Users, BookOpen, Award } from "lucide-react"; 
import SmartOnboardingModal from "./components/SmartOnboardingModal";
import StudentMarketplace from "./components/StudentMarketplace"; // <--- Import Komponen Baru
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Hapus searchParams karena filter sudah dipindah ke Client-Side
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isAdmin = profile?.role?.toLowerCase() === 'admin';

  // ============================================================================
  // BLOKIR JIKA PROFIL GOOGLE BELUM LENGKAP
  // ============================================================================
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

    revalidatePath("/dashboard");
  }

  if (isProfileIncomplete) {
      return (
          <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-6 overflow-y-auto">
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
      );
  }


  // ============================================================================
  // TAMPILAN KHUSUS ADMIN (RINGKASAN ANALITIK)
  // ============================================================================
  if (isAdmin) {
    const { count: totalStudents } = await supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin");
    const { count: activeCourses } = await supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true);

    const { data: realEnrollments } = await supabase.from("enrollments").select("course_id, courses(id, title, price, thumbnail_url)");

    let totalRevenue = 0;
    let totalSales = realEnrollments?.length || 0;
    const courseStats: Record<string, any> = {};

    realEnrollments?.forEach((e: any) => {
       const c = e.courses;
       if (!c) return;
       totalRevenue += (c.price || 0);
       if (!courseStats[c.id]) courseStats[c.id] = { id: c.id, title: c.title, price: c.price, thumbnail_url: c.thumbnail_url, real_sales: 0 };
       courseStats[c.id].real_sales += 1;
    });

    const topCourses = Object.values(courseStats).sort((a, b) => b.real_sales - a.real_sales).slice(0, 4);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">Halo, <span className="text-[#00C9A7]">{profile?.full_name || 'Admin'}</span> 👋</h1>
                <p className="text-gray-500 mt-1">Berikut adalah ringkasan performa nyata platform Anda hari ini.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div><p className="text-sm font-bold text-gray-500 mb-1">Pendapatan</p><h3 className="text-2xl font-black text-gray-900">Rp {totalRevenue.toLocaleString("id-ID")}</h3></div>
                        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Wallet size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div><p className="text-sm font-bold text-gray-500 mb-1">Penjualan</p><h3 className="text-2xl font-black text-gray-900">{totalSales} <span className="text-sm font-medium text-gray-400">Kelas</span></h3></div>
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div><p className="text-sm font-bold text-gray-500 mb-1">Siswa</p><h3 className="text-2xl font-black text-gray-900">{totalStudents || 0} <span className="text-sm font-medium text-gray-400">Orang</span></h3></div>
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div><p className="text-sm font-bold text-gray-500 mb-1">Kelas Aktif</p><h3 className="text-2xl font-black text-gray-900">{activeCourses || 0} <span className="text-sm font-medium text-gray-400">Live</span></h3></div>
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><BookOpen size={20} /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><Award size={20} className="text-[#F97316]" /> Kelas Terlaris</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topCourses.length === 0 ? (
                            <p className="text-sm text-gray-400 italic py-4">Belum ada data penjualan.</p>
                        ) : topCourses.map((course: any, idx: number) => (
                            <div key={course.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                                <div className="w-6 font-black text-gray-300 text-lg text-center">{idx + 1}</div>
                                <div className="relative w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                    {course.thumbnail_url ? <Image src={course.thumbnail_url} alt="Cover" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{course.title}</h4>
                                    <p className="text-xs text-gray-500 font-medium">{course.real_sales} Orang Daftar</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#00C9A7]">Rp {(course.price * course.real_sales).toLocaleString("id-ID")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // ============================================================================
  // TAMPILAN SISWA (MENGGUNAKAN STUDENT MARKETPLACE BARU)
  // ============================================================================
  
  // 1. Ambil ID Kelas yang sudah dimiliki siswa
  const { data: myEnrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
  const ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];

  // 2. Ambil List Kategori & Sub Kategori
  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");
  const { data: subCategories } = await supabase.from("sub_categories").select("id, name, main_category_id").order("name");

  // 3. Ambil SEMUA Kelas yang di-publish untuk difilter di Client Side
  const { data: courses } = await supabase
    .from("courses")
    .select(`*, main_categories!main_category_id(id, name), sub_categories!sub_category_id(id, name), course_levels!level_id(id, name)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans selection:bg-[#F97316] selection:text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Halo, <span className="text-[#F97316]">{profile?.full_name || 'Siswa'}</span> 👋</h1>
        <p className="text-gray-500 mt-1">Siap melanjutkan pembelajaran hari ini?</p>
      </div>

      {/* Memanggil Komponen StudentMarketplace yang menangani filter secara Instan */}
      <StudentMarketplace 
        courses={courses || []} 
        mainCategories={categories || []} 
        subCategories={subCategories || []} 
        ownedCourseIds={ownedCourseIds}
      />

      {/* TAMPILKAN POPUP SMART ONBOARDING UNTUK SISWA BARU */}
      <SmartOnboardingModal categories={categories || []} isCompleted={profile?.onboarding_completed || false} />

    </div>
  );
}