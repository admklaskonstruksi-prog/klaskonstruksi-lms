import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Wallet, TrendingUp, Users, BookOpen, Award, BookText } from "lucide-react"; 
import SmartOnboardingModal from "./components/SmartOnboardingModal";
import StudentMarketplace from "./components/StudentMarketplace"; 

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isAdmin = profile?.role?.toLowerCase() === 'admin';

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka || 0);
  };

  // ============================================================================
  // TAMPILAN KHUSUS ADMIN
  // ============================================================================
  if (isAdmin) {
    const { count: totalStudents } = await supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin");
    const { count: activeCourses } = await supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true);
    const { data: realEnrollments } = await supabase.from("enrollments").select("course_id, courses(id, title, price, thumbnail_url)");
    const { count: ebookSalesCount } = await supabase.from("ebook_purchases").select("*", { count: "exact", head: true });

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
        <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans selection:bg-[#00C9A7] selection:text-white">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">Halo, <span className="text-[#00C9A7]">{profile?.full_name || 'Admin'}</span> 👋</h1>
                <p className="text-gray-500 mt-1">Berikut adalah ringkasan performa nyata platform Anda hari ini.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pendapatan</p>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">Rp {formatRupiah(totalRevenue)}</h3>
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><Wallet size={16} /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Siswa</p>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">{totalStudents || 0} <span className="text-sm font-medium text-gray-400">Orang</span></h3>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={16} /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center border-l-4 border-l-[#F97316]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jual Kelas</p>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">{totalSales} <span className="text-sm font-medium text-gray-400">Lisensi</span></h3>
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center"><TrendingUp size={16} /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center border-l-4 border-l-[#00C9A7]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jual E-Book</p>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">{ebookSalesCount || 0} <span className="text-sm font-medium text-gray-400">Lisensi</span></h3>
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#00C9A7] flex items-center justify-center"><BookText size={16} /></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kelas Aktif</p>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">{activeCourses || 0} <span className="text-sm font-medium text-gray-400">Live</span></h3>
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><BookOpen size={16} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><Award size={20} className="text-[#F97316]" /> Kelas Terlaris</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topCourses.length === 0 ? (
                            <p className="text-sm text-gray-400 italic py-4">Belum ada data penjualan.</p>
                        ) : topCourses.map((course: any, idx: number) => (
                            <div key={course.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#00C9A7]/30 transition-colors">
                                <div className="w-6 font-black text-gray-300 text-lg text-center">{idx + 1}</div>
                                <div className="relative w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                    {course.thumbnail_url ? <Image src={course.thumbnail_url} alt="Cover" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{course.title}</h4>
                                    <p className="text-xs text-[#F97316] font-bold">{course.real_sales} Orang Daftar</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#00C9A7]">Rp {formatRupiah(course.price * course.real_sales)}</p>
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
  // TAMPILAN SISWA 
  // ============================================================================
  const { data: myEnrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
  const ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];

  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");
  const { data: subCategories } = await supabase.from("sub_categories").select("id, name, main_category_id").order("name");
  const { data: levels } = await supabase.from("course_levels").select("id, name").order("id"); 

  const { data: courses } = await supabase
    .from("courses")
    .select(`*, main_categories!main_category_id(id, name), sub_categories!sub_category_id(id, name), course_levels!level_id(id, name)`)
    // FILTER IS_PUBLISHED DIHAPUS DISINI AGAR DRAFT MUNCUL SEBAGAI COMING SOON
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans selection:bg-[#F97316] selection:text-white">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Halo, <span className="text-[#F97316]">{profile?.full_name || 'Siswa'}</span> 👋</h1>
        <p className="text-gray-500 mt-1">Siap melanjutkan pembelajaran hari ini?</p>
      </div>

      <StudentMarketplace 
        courses={courses || []} 
        mainCategories={categories || []} 
        subCategories={subCategories || []} 
        levels={levels || []} 
        ownedCourseIds={ownedCourseIds}
      />

      <SmartOnboardingModal categories={categories || []} isCompleted={profile?.onboarding_completed || false} />
    </div>
  );
}