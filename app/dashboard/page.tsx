import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, StarHalf, Search } from "lucide-react"; 

// Kita tambahkan searchParams untuk menangkap URL (Filter & Sort)
export default async function DashboardPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();

  // 1. Cek User Login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 2. Ambil data Profile untuk nama user
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 3. TANGKAP PARAMETER URL (Filter Kategori, Sorting, dan Pencarian)
  // (Aman untuk Next.js 14 maupun Next.js 15)
  const sp = await searchParams; 
  const categoryFilter = sp?.category || "semua";
  const sortFilter = sp?.sort || "terbaru";
  const searchQ = sp?.q || "";

  // 4. MEMBANGUN QUERY DATABASE SECARA DINAMIS
  let query = supabase.from("courses").select("*").eq("is_published", true);

  // Jika Kategori dipilih (dan bukan "semua")
  if (categoryFilter !== "semua") {
    query = query.eq("main_category_id", categoryFilter);
  }

  // Jika ada kata kunci pencarian
  if (searchQ) {
    query = query.ilike("title", `%${searchQ}%`);
  }

  // Jika filter Sorting diklik
  if (sortFilter === "terpopuler") {
    query = query.order("sales_count", { ascending: false }); // Urutkan penjualan terbanyak
  } else {
    query = query.order("created_at", { ascending: false });  // Urutkan kelas terbaru
  }

  // Eksekusi Query Kelas
  const { data: courses } = await query;

  // 5. AMBIL DAFTAR KATEGORI ASLI DARI DATABASE UNTUK TOMBOL
  const { data: categories } = await supabase.from("main_categories").select("id, name").order("name");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* --- BAGIAN 1: HEADER & SAPAAN --- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Halo, <span className="text-[#00C9A7]">{profile?.full_name || 'Siswa'}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Siap melanjutkan pembelajaran hari ini?</p>
      </div>

      {/* --- BAGIAN 2: PENCARIAN & KATEGORI DINAMIS --- */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Jelajah Kelas</h2>
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Form Pencarian (Mengubah URL tanpa JavaScript) */}
          <form method="GET" className="relative flex-1 flex items-center">
             {/* Simpan filter saat ini agar tidak hilang saat mencari */}
             <input type="hidden" name="category" value={categoryFilter} />
             <input type="hidden" name="sort" value={sortFilter} />
             
             <div className="relative w-full border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center focus-within:ring-2 focus-within:ring-[#00C9A7] transition-all">
               <Search size={20} className="text-gray-400 absolute left-3" />
               <input
                 type="text"
                 name="q"
                 defaultValue={searchQ}
                 placeholder="Cari kelas yang ingin Anda pelajari..."
                 className="w-full py-3 pl-10 pr-3 outline-none text-sm text-gray-700 bg-transparent"
               />
               <button type="submit" className="hidden">Cari</button>
             </div>
          </form>

          {/* Tombol Filter Kategori (Otomatis dari Database) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            
            <Link 
              href={`?category=semua&sort=${sortFilter}&q=${searchQ}`}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                categoryFilter === "semua" ? "bg-[#00C9A7] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua
            </Link>

            {categories?.map((cat) => (
              <Link 
                key={cat.id}
                href={`?category=${cat.id}&sort=${sortFilter}&q=${searchQ}`}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                  categoryFilter === cat.id ? "bg-[#00C9A7] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-100" />

      {/* --- BAGIAN 3: DAFTAR KELAS (GAYA UDEMY) --- */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
           Kursus untuk membantu Anda memulai
        </h2>
        <p className="text-gray-600 text-sm">
           Jelajahi kursus dari para ahli dunia nyata yang berpengalaman.
        </p>
      </div>

      {/* Tabs Filter Sort (Terpopuler / Terbaru) */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
        <Link 
           href={`?category=${categoryFilter}&sort=terpopuler&q=${searchQ}`}
           className={`pb-3 text-sm whitespace-nowrap transition-colors ${
             sortFilter === "terpopuler" ? "text-black font-bold border-b-2 border-black" : "text-gray-500 hover:text-black font-medium"
           }`}
        >
           Terpopuler
        </Link>
        <Link 
           href={`?category=${categoryFilter}&sort=terbaru&q=${searchQ}`}
           className={`pb-3 text-sm whitespace-nowrap transition-colors ${
             sortFilter === "terbaru" ? "text-black font-bold border-b-2 border-black" : "text-gray-500 hover:text-black font-medium"
           }`}
        >
           Terbaru
        </Link>
      </div>

      {/* Grid Kelas */}
      {courses?.length === 0 ? (
         <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Tidak ada kelas yang sesuai dengan filter Anda.
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {courses?.map((course) => (
            
            <Link href={`/dashboard/checkout/${course.id}`} key={course.id} className="flex flex-col gap-1 cursor-pointer group w-full">
              
              <div className="relative aspect-video w-full border border-gray-200 overflow-hidden mb-1 rounded-md">
                {course.thumbnail_url ? (
                  <Image 
                    src={course.thumbnail_url} 
                    alt={course.title} 
                    fill 
                    className="object-cover group-hover:opacity-90 transition-opacity" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                    No Image
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-[15px] leading-tight line-clamp-2 mt-1 group-hover:text-[#00C9A7] transition-colors">
                {course.title}
              </h3>

              <p className="text-xs text-gray-500 mt-0.5">Klas Konstruksi</p>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-0.5">
                {course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#b4690e]">{course.rating}</span>
                    <div className="flex text-[#b4690e]">
                      <Star size={12} fill="currentColor" strokeWidth={0} />
                      <Star size={12} fill="currentColor" strokeWidth={0} />
                      <Star size={12} fill="currentColor" strokeWidth={0} />
                      <Star size={12} fill="currentColor" strokeWidth={0} />
                      <StarHalf size={12} fill="currentColor" strokeWidth={0} />
                    </div>
                    {course.review_count > 0 && (
                      <span className="text-gray-500">({course.review_count.toLocaleString("id-ID")})</span>
                    )}
                  </div>
                )}
                
                {course.rating > 0 && course.sales_count > 0 && (
                  <span className="text-gray-300 hidden sm:inline">•</span>
                )}

                {course.sales_count > 0 && (
                   <span className="text-gray-500 font-medium">
                     {course.sales_count.toLocaleString("id-ID")} Terjual
                   </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                {course.price > 0 ? (
                  <>
                    <span className="font-bold text-gray-900 text-base">
                      Rp {course.price.toLocaleString("id-ID")}
                    </span>
                    {course.strike_price > 0 && (
                        <span className="text-gray-500 line-through text-sm">
                          Rp {course.strike_price.toLocaleString("id-ID")}
                        </span>
                    )}
                  </>
                ) : (
                  <span className="font-bold text-gray-900 text-base">Gratis</span>
                )}
              </div>

              <div className="mt-1">
                <span className="bg-[#eceb98] text-[#3d3c0a] text-[10px] font-bold px-2 py-1 rounded-sm inline-block">
                  Terlaris
                </span>
              </div>

            </Link>
          ))}
        </div>
      )}

    </div>
  );
}