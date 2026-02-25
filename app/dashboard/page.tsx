import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, StarHalf, Search } from "lucide-react"; 
import SmartOnboardingModal from "./components/SmartOnboardingModal";

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Tarik data profil, termasuk role (hak akses)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // --- CEK KELAS YANG SUDAH DIBELI ---
  const { data: myEnrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id);
  const ownedCourseIds = myEnrollments?.map((e) => e.course_id) || [];

  const sp = await searchParams; 
  const categoryFilter = sp?.category || "semua";
  const sortFilter = sp?.sort || "terbaru";
  const searchQ = sp?.q || "";

  // Query kelas dasar
  let query = supabase.from("courses").select("*").eq("is_published", true);

  if (categoryFilter !== "semua") {
    query = query.eq("main_category_id", categoryFilter);
  }

  if (searchQ) {
    query = query.ilike("title", `%${searchQ}%`);
  }

  if (sortFilter === "terpopuler") {
    query = query.order("sales_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false }); 
  }

  const { data: courses } = await query;
  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");

  // Cek apakah user adalah admin (Pastikan huruf kecil untuk pencocokan yang aman)
  const isAdmin = profile?.role?.toLowerCase() === 'admin';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans selection:bg-[#F97316] selection:text-white">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Halo, <span className="text-[#F97316]">{profile?.full_name || 'Siswa'}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">
           {isAdmin ? "Selamat datang di panel kontrol Admin." : "Siap melanjutkan pembelajaran hari ini?"}
        </p>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Jelajah Kelas</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <form method="GET" className="relative flex-1 flex items-center">
             <input type="hidden" name="category" value={categoryFilter} />
             <input type="hidden" name="sort" value={sortFilter} />
             
             <div className="relative w-full border border-gray-200 rounded-xl overflow-hidden bg-white flex items-center focus-within:ring-2 focus-within:ring-[#F97316] transition-all shadow-sm">
               <Search size={20} className="text-gray-400 absolute left-4" />
               <input
                 type="text"
                 name="q"
                 defaultValue={searchQ}
                 placeholder="Cari kelas yang ingin Anda pelajari..."
                 className="w-full py-3.5 pl-12 pr-4 outline-none text-sm text-gray-700 bg-transparent font-medium"
               />
               <button type="submit" className="hidden">Cari</button>
             </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Link 
              href={`?category=semua&sort=${sortFilter}&q=${searchQ}`}
              className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                categoryFilter === "semua" ? "bg-[#F97316] text-white shadow-md shadow-orange-500/20" : "bg-white border border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316]"
              }`}
            >
              Semua
            </Link>
            {categories?.map((cat) => (
              <Link 
                key={cat.id}
                href={`?category=${cat.id}&sort=${sortFilter}&q=${searchQ}`}
                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                  categoryFilter === cat.id ? "bg-[#F97316] text-white shadow-md shadow-orange-500/20" : "bg-white border border-gray-200 text-gray-600 hover:border-[#F97316] hover:text-[#F97316]"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-100" />

      {/* DAFTAR KELAS */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilihan Program Terbaik</h2>
           <p className="text-gray-500 text-sm">Tingkatkan skill konstruksi Anda dengan materi siap kerja.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
           <Link 
              href={`?category=${categoryFilter}&sort=terpopuler&q=${searchQ}`}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                sortFilter === "terpopuler" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
           >
              Terpopuler
           </Link>
           <Link 
              href={`?category=${categoryFilter}&sort=terbaru&q=${searchQ}`}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                sortFilter === "terbaru" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
           >
              Terbaru
           </Link>
        </div>
      </div>

      {courses?.length === 0 ? (
         <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            Tidak ada kelas yang sesuai dengan filter Anda.
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses?.map((course) => {
            const isOwned = ownedCourseIds.includes(course.id);
            
            return (
            <Link 
              href={isOwned ? `/dashboard/learning-path/${course.id}` : `/dashboard/checkout/${course.id}`} 
              key={course.id} 
              className={`flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 group ${isOwned ? 'opacity-80 grayscale-[40%] hover:grayscale-0' : 'hover:shadow-xl hover:border-[#F97316]/50'}`}
            >
              
              <div className="relative aspect-video w-full bg-gray-100 border-b border-gray-100 overflow-hidden">
                {course.thumbnail_url ? (
                  <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">No Image</div>
                )}
                {course.sales_count > 100 && !isOwned && (
                   <div className="absolute top-3 left-3 bg-[#eceb98] text-[#3d3c0a] text-[10px] font-black px-2.5 py-1 rounded shadow-sm tracking-wide uppercase">
                     TERLARIS
                   </div>
                )}
                
                {isOwned && (
                   <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-[1px]">
                     <span className="bg-white text-[#F97316] font-black px-4 py-2 rounded-lg shadow-lg text-sm">
                       SUDAH DIMILIKI
                     </span>
                   </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                 <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    <span className="bg-orange-50 text-[#F97316] px-2 py-0.5 rounded-sm">{course.level || "ALL LEVEL"}</span>
                 </div>

                 <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#F97316] transition-colors">
                   {course.title}
                 </h3>

                 <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-4 mt-auto">
                   {course.rating > 0 && (
                     <div className="flex items-center gap-1">
                       <span className="font-bold text-[#b4690e]">{course.rating}</span>
                       <div className="flex text-[#b4690e]">
                         <Star size={12} fill="currentColor" strokeWidth={0} />
                         <StarHalf size={12} fill="currentColor" strokeWidth={0} />
                       </div>
                       {course.review_count > 0 && <span className="text-gray-500">({course.review_count})</span>}
                     </div>
                   )}
                   {course.rating > 0 && course.sales_count > 0 && <span className="text-gray-300 hidden sm:inline">•</span>}
                   {course.sales_count > 0 && <span className="text-gray-500 font-medium">{course.sales_count} Terjual</span>}
                 </div>

                 <div className="pt-3 border-t border-gray-100 flex items-end justify-between gap-2 mt-auto">
                   <div>
                     {course.price > 0 ? (
                       <>
                         <span className="font-black text-gray-900 text-lg">Rp {course.price.toLocaleString("id-ID")}</span>
                         {!isOwned && course.strike_price > 0 && <span className="text-gray-400 line-through text-xs mb-1 font-medium ml-2">Rp {course.strike_price.toLocaleString("id-ID")}</span>}
                       </>
                     ) : (
                       <span className="font-black text-[#F97316] text-lg">Gratis</span>
                     )}
                   </div>
                   
                   {isOwned && (
                     <span className="text-[11px] font-bold text-[#00C9A7] bg-teal-50 px-2 py-1 rounded">Masuk Kelas</span>
                   )}
                 </div>
              </div>
            </Link>
          )})}
        </div>
      )}

      {/* --- KOMPONEN ONBOARDING DIMASUKKAN DI SINI --- */}
      {/* HANYA MUNCUL JIKA USER BUKAN ADMIN */}
      {!isAdmin && (
        <SmartOnboardingModal 
          categories={categories || []} 
          isCompleted={profile?.onboarding_completed || false} 
        />
      )}

    </div>
  );
}