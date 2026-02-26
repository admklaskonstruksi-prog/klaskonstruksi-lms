import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, StarHalf, Search, Users, Wallet, BookOpen, TrendingUp, BarChart3, Award, ArrowUpRight } from "lucide-react"; 
import SmartOnboardingModal from "./components/SmartOnboardingModal";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isAdmin = profile?.role?.toLowerCase() === 'admin';

  if (isAdmin) {
    // 1. Tarik Jumlah Siswa
    const { count: totalStudents } = await supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin");
    
    // 2. Tarik Jumlah Kelas Aktif
    const { count: activeCourses } = await supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true);

    // 3. TARIK DATA PENJUALAN ASLI (REAL) DARI ENROLLMENTS
    const { data: realEnrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses(id, title, price, thumbnail_url)");

    let totalRevenue = 0;
    let totalSales = realEnrollments?.length || 0;

    // Kalkulasi Pendapatan dan Leaderboard Asli
    const courseStats: Record<string, any> = {};

    realEnrollments?.forEach((e: any) => {
       const c = e.courses;
       if (!c) return;
       
       totalRevenue += (c.price || 0);

       if (!courseStats[c.id]) {
           courseStats[c.id] = { id: c.id, title: c.title, price: c.price, thumbnail_url: c.thumbnail_url, real_sales: 0 };
       }
       courseStats[c.id].real_sales += 1;
    });

    // Urutkan kelas terlaris berdasarkan penjualan real
    const topCourses = Object.values(courseStats)
       .sort((a, b) => b.real_sales - a.real_sales)
       .slice(0, 4);

    const weeklySales = [
        { day: "Sen", amount: 1200000 }, { day: "Sel", amount: 2500000 },
        { day: "Rab", amount: 1800000 }, { day: "Kam", amount: 3200000 },
        { day: "Jum", amount: 2900000 }, { day: "Sab", amount: 4500000 }, { day: "Min", amount: 5100000 }
    ];
    const maxSale = Math.max(...weeklySales.map(s => s.amount));

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">Halo, <span className="text-[#00C9A7]">{profile?.full_name || 'Admin'}</span> 👋</h1>
                <p className="text-gray-500 mt-1">Berikut adalah ringkasan performa nyata platform Anda hari ini.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-1">Total Pendapatan</p>
                            <h3 className="text-2xl font-black text-gray-900">Rp {totalRevenue.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Wallet size={20} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-1">Total Penjualan</p>
                            <h3 className="text-2xl font-black text-gray-900">{totalSales} <span className="text-sm font-medium text-gray-400">Kelas</span></h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-1">Total Siswa</p>
                            <h3 className="text-2xl font-black text-gray-900">{totalStudents || 0} <span className="text-sm font-medium text-gray-400">Orang</span></h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={20} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-1">Kelas Aktif</p>
                            <h3 className="text-2xl font-black text-gray-900">{activeCourses || 0} <span className="text-sm font-medium text-gray-400">Live</span></h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><BookOpen size={20} /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BarChart3 size={20} className="text-[#00C9A7]" /> Trend Penjualan (7 Hari)</h3>
                            <p className="text-xs text-gray-400 mt-1">*Simulasi visual trend pendapatan</p>
                        </div>
                        <span className="text-xs font-bold bg-green-50 text-green-600 px-3 py-1.5 rounded-lg flex items-center gap-1"><ArrowUpRight size={14}/> +15.4%</span>
                    </div>

                    <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 mt-auto pt-4 relative">
                        <div className="absolute inset-0 flex flex-col justify-between pb-8 z-0">
                            {[1,2,3,4].map(i => <div key={i} className="w-full border-t border-gray-100 border-dashed"></div>)}
                        </div>

                        {weeklySales.map((data, idx) => {
                            const heightPercentage = (data.amount / maxSale) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 relative z-10 group">
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity pointer-events-none">
                                        Rp {data.amount.toLocaleString("id-ID")}
                                    </div>
                                    <div className="w-full bg-[#00C9A7]/20 rounded-t-lg relative overflow-hidden group-hover:bg-[#00C9A7]/30 transition-colors" style={{ height: '100%' }}>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#00C9A7] to-[#00E5C0] rounded-t-lg transition-all duration-1000" style={{ height: `${heightPercentage}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">{data.day}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><Award size={20} className="text-[#F97316]" /> Kelas Terlaris (Real)</h3>
                    
                    <div className="space-y-4">
                        {topCourses.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center py-4">Belum ada data penjualan asli.</p>
                        ) : topCourses.map((course: any, idx: number) => (
                            <div key={course.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="w-6 font-black text-gray-300 text-lg text-center">{idx + 1}</div>
                                <div className="relative w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                    {course.thumbnail_url ? (
                                        <Image src={course.thumbnail_url} alt="Cover" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>
                                    )}
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
                    <Link href="/dashboard/courses" className="block w-full text-center mt-6 text-sm font-bold text-gray-500 hover:text-[#00C9A7] transition-colors">
                        Kelola Kelas &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
  }

  // === TAMPILAN USER BIASA TETAP SAMA ===
  const { data: myEnrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id);
  const ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];

  const sp = await searchParams; 
  const categoryFilter = sp?.category || "semua";
  const sortFilter = sp?.sort || "terbaru";
  const searchQ = sp?.q || "";

  let query = supabase.from("courses").select("*").eq("is_published", true);

  if (categoryFilter !== "semua") query = query.eq("main_category_id", categoryFilter);
  if (searchQ) query = query.ilike("title", `%${searchQ}%`);

  if (sortFilter === "terpopuler") query = query.order("sales_count", { ascending: false });
  else query = query.order("created_at", { ascending: false }); 

  const { data: courses } = await query;
  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans selection:bg-[#F97316] selection:text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Halo, <span className="text-[#F97316]">{profile?.full_name || 'Siswa'}</span> 👋</h1>
        <p className="text-gray-500 mt-1">Siap melanjutkan pembelajaran hari ini?</p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Jelajah Kelas</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <form method="GET" className="relative flex-1 flex items-center">
             <input type="hidden" name="category" value={categoryFilter} />
             <input type="hidden" name="sort" value={sortFilter} />
             <div className="relative w-full border border-gray-200 rounded-xl overflow-hidden bg-white flex items-center focus-within:ring-2 focus-within:ring-[#F97316] transition-all shadow-sm">
               <Search size={20} className="text-gray-400 absolute left-4" />
               <input type="text" name="q" defaultValue={searchQ} placeholder="Cari kelas yang ingin Anda pelajari..." className="w-full py-3.5 pl-12 pr-4 outline-none text-sm text-gray-700 bg-transparent font-medium" />
               <button type="submit" className="hidden">Cari</button>
             </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Link href={`?category=semua&sort=${sortFilter}&q=${searchQ}`} className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition ${categoryFilter === "semua" ? "bg-[#F97316] text-white shadow-md shadow-orange-500/20" : "bg-white border border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316]"}`}>Semua</Link>
            {categories?.map((cat) => (
              <Link key={cat.id} href={`?category=${cat.id}&sort=${sortFilter}&q=${searchQ}`} className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition ${categoryFilter === cat.id ? "bg-[#F97316] text-white shadow-md shadow-orange-500/20" : "bg-white border border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316]"}`}>{cat.name}</Link>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-100" />

      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilihan Program Terbaik</h2>
           <p className="text-gray-500 text-sm">Tingkatkan skill Anda dengan materi siap kerja.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
           <Link href={`?category=${categoryFilter}&sort=terpopuler&q=${searchQ}`} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${sortFilter === "terpopuler" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>Terpopuler</Link>
           <Link href={`?category=${categoryFilter}&sort=terbaru&q=${searchQ}`} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${sortFilter === "terbaru" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>Terbaru</Link>
        </div>
      </div>

      {courses?.length === 0 ? (
         <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Tidak ada kelas yang sesuai filter Anda.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses?.map((course) => {
            const isOwned = ownedCourseIds.includes(course.id);
            return (
            <Link href={isOwned ? `/dashboard/learning-path/${course.id}` : `/dashboard/checkout/${course.id}`} key={course.id} className={`flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 group ${isOwned ? 'opacity-80 grayscale-[40%] hover:grayscale-0' : 'hover:shadow-xl hover:border-[#F97316]/50'}`}>
              <div className="relative aspect-video w-full bg-gray-100 border-b border-gray-100 overflow-hidden">
                {course.thumbnail_url ? (
                  <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">No Image</div>
                )}
                {course.sales_count > 100 && !isOwned && (
                   <div className="absolute top-3 left-3 bg-[#eceb98] text-[#3d3c0a] text-[10px] font-black px-2.5 py-1 rounded shadow-sm tracking-wide uppercase">TERLARIS</div>
                )}
                {isOwned && (
                   <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-[1px]">
                     <span className="bg-white text-[#F97316] font-black px-4 py-2 rounded-lg shadow-lg text-sm">SUDAH DIMILIKI</span>
                   </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                 <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#F97316] transition-colors">{course.title}</h3>
                 <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-4 mt-auto">
                   {course.rating > 0 && (
                     <div className="flex items-center gap-1">
                       <span className="font-bold text-[#b4690e]">{course.rating}</span>
                       <div className="flex text-[#b4690e]"><Star size={12} fill="currentColor" strokeWidth={0} /><StarHalf size={12} fill="currentColor" strokeWidth={0} /></div>
                       {course.review_count > 0 && <span className="text-gray-500">({course.review_count})</span>}
                     </div>
                   )}
                 </div>
                 <div className="pt-3 border-t border-gray-100 flex items-end justify-between gap-2 mt-auto">
                   <div>
                     {course.price > 0 ? (
                       <><span className="font-black text-gray-900 text-lg">Rp {course.price.toLocaleString("id-ID")}</span></>
                     ) : (<span className="font-black text-[#F97316] text-lg">Gratis</span>)}
                   </div>
                   {isOwned && (<span className="text-[11px] font-bold text-[#00C9A7] bg-teal-50 px-2 py-1 rounded">Masuk Kelas</span>)}
                 </div>
              </div>
            </Link>
          )})}
        </div>
      )}

      <SmartOnboardingModal categories={categories || []} isCompleted={profile?.onboarding_completed || false} />
    </div>
  );
}