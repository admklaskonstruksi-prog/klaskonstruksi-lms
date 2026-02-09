import { createClient } from "@/utils/supabase/server";
import { BookOpen, Users, DollarSign, TrendingUp } from "lucide-react";
import StudentMarketplace from "@/app/dashboard/components/StudentMarketplace"; 
import Link from "next/link";
import { redirect } from "next/navigation";

// --- KOMPONEN HELPER (KARTU STATISTIK ADMIN) ---
function AdminStatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  };
  
  return (
    <div className={`p-6 rounded-2xl border flex items-center gap-4 ${colors[color] || colors.blue}`}>
      <div className={`p-3 rounded-xl bg-white shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider font-bold opacity-70">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // 1. Cek User Session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  // 2. Fetch Profile untuk Cek Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // === DATA FETCHING VARIABLES ===
  // Variabel untuk Admin
  let analyticsData = { 
    stats: { courses: 0, users: 0, revenue: 0, enrollments: 0 },
    recentCourses: [] as any[]
  };

  // Variabel untuk Siswa
  let studentCourses: any[] = [];
  let categories: any[] = [];

  // === LOGIC CABANG (ADMIN VS SISWA) ===
  if (isAdmin) {
    // --- ADMIN LOGIC ---
    
    // Hitung Total Kelas
    const { count: totalCourses } = await supabase.from("courses").select("*", { count: 'exact', head: true });
    
    // Hitung Total User (Kecuali Admin)
    const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .neq('role', 'admin');
    
    // Hitung Revenue (Total Harga dari Enrollment)
    const { data: enrollmentData } = await supabase.from("enrollments").select("courses(price)");
    const totalRevenue = enrollmentData?.reduce((acc, curr: any) => acc + (curr.courses?.price || 0), 0) || 0;
    
    // Hitung Total Enrollment
    const { count: totalEnrollments } = await supabase.from("enrollments").select("*", { count: 'exact', head: true });

    analyticsData.stats = {
        courses: totalCourses || 0,
        users: totalUsers || 0,
        revenue: totalRevenue,
        enrollments: totalEnrollments || 0
    };

    // Ambil 5 Kelas Terbaru untuk Tabel Admin
    const { data: recentCourses } = await supabase
        .from("courses")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(5);
        
    analyticsData.recentCourses = recentCourses || [];

  } else {
    // --- STUDENT LOGIC (DIPERBARUI) ---
    // Mengambil data yang dibutuhkan oleh <StudentMarketplace />
    
    // 1. Ambil Semua Course (Lengkap dengan Nama Kategori)
    const { data: coursesData } = await supabase
      .from("courses")
      .select(`
        *,
        categories (name)
      `)
      .order("created_at", { ascending: false });
    
    studentCourses = coursesData || [];

    // 2. Ambil Semua Kategori untuk Filter
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .order("name");
      
    categories = categoriesData || [];
  }

  return (
    <div>
      {/* HEADER DASHBOARD */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">
             Halo, <span className="text-[#00C9A7]">{profile?.full_name || "Pengguna"}</span> 👋
           </h1>
           <p className="text-gray-500 text-sm mt-1">
             {isAdmin ? "Panel kontrol administrator sistem." : "Siap melanjutkan pembelajaran hari ini?"}
           </p>
        </div>
      </div>

      {isAdmin ? (
        // --- TAMPILAN ADMIN ---
        <div className="space-y-8">
            
            {/* 1. KARTU STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard title="Total Kelas" value={analyticsData.stats.courses} icon={BookOpen} color="blue" />
                <AdminStatCard title="Total Pengguna" value={analyticsData.stats.users} icon={Users} color="green" />
                <AdminStatCard title="Total Penjualan" value={analyticsData.stats.enrollments} icon={TrendingUp} color="purple" />
                <AdminStatCard title="Pendapatan" value={`Rp ${(analyticsData.stats.revenue / 1000).toLocaleString()}k`} icon={DollarSign} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. SHORTCUT CARD (MENU CEPAT) */}
                <div className="lg:col-span-1 bg-[#00C9A7] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                      <h3 className="font-bold mb-4 relative z-10 text-lg">Shortcut Cepat</h3>
                      <div className="space-y-3 relative z-10">
                         <Link href="/dashboard/analytics/sales" className="block p-3 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer">
                             <p className="text-xs text-green-100 opacity-80 mb-1">Cek Keuangan</p>
                             <div className="flex justify-between items-center">
                                 <span className="font-bold">Laporan Penjualan</span>
                                 <TrendingUp size={16} />
                             </div>
                         </Link>
                         <Link href="/dashboard/analytics/users" className="block p-3 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer">
                             <p className="text-xs text-green-100 opacity-80 mb-1">Cek Pengguna</p>
                             <div className="flex justify-between items-center">
                                 <span className="font-bold">Analitik Pengguna</span>
                                 <Users size={16} />
                             </div>
                         </Link>
                      </div>
                </div>

                {/* 3. TABEL KELAS TERBARU (Limit 5) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Kelas Terbaru</h3>
                        <Link href="/dashboard/courses/create" className="text-xs font-bold text-[#00C9A7] hover:underline">+ Buat Baru</Link>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Nama Kelas</th>
                                <th className="px-6 py-4">Harga</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {analyticsData.recentCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{course.title}</td>
                                    <td className="px-6 py-4">
                                        {course.price === 0 ? "GRATIS" : `Rp ${(course.price / 1000).toLocaleString()}k`}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/dashboard/courses/${course.id}`} className="text-[#00C9A7] font-bold text-xs hover:underline">Kelola</Link>
                                    </td>
                                </tr>
                            ))}
                            {analyticsData.recentCourses.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                        Belum ada kelas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      ) : (
        // --- TAMPILAN SISWA (MARKETPLACE) ---
        // Mengirim data courses & categories yang sudah difetch di atas
        <StudentMarketplace 
            courses={studentCourses} 
            categories={categories} 
        />
      )}
    </div>
  );
}