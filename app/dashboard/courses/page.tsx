import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit3, Eye, EyeOff, LayoutList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Cek Admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  const sp = await searchParams;
  const searchQ = sp?.q || "";
  const sortFilter = sp?.sort || "terbaru";

  // PERBAIKAN: Gunakan pemetaan relasi eksplisit (!) agar Supabase tidak bingung
  let query = supabase.from("courses").select(`
    *,
    main_categories!main_category_id ( id, name ),
    sub_categories!sub_category_id ( id, name ),
    course_levels!level_id ( id, name ), 
    chapters ( id )
  `);

  if (searchQ) query = query.ilike("title", `%${searchQ}%`);

  if (sortFilter === "terbaru") query = query.order("created_at", { ascending: false });
  if (sortFilter === "terlama") query = query.order("created_at", { ascending: true });
  if (sortFilter === "harga-tinggi") query = query.order("price", { ascending: false });
  if (sortFilter === "harga-rendah") query = query.order("price", { ascending: true });

  const { data: courses, error } = await query;

  if (error) {
    console.error("Error mengambil data kelas:", error);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kelola Kelas</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar semua kelas, kategori, dan status publikasi.</p>
        </div>
        <Link href="/dashboard/courses/create" className="bg-[#00C9A7] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00b596] transition-colors shadow-lg shadow-[#00C9A7]/20">
          <Plus size={18} /> Buat Kelas Baru
        </Link>
      </div>

      {/* PERBAIKAN FILTER BAR: Dibuat menggunakan 1 form dan tombol Terapkan, tanpa event onChange */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <form method="GET" className="flex flex-col md:flex-row gap-4">
           {/* Kotak Pencarian */}
           <div className="relative flex-1 flex items-center">
             <Search size={18} className="absolute left-4 text-gray-400" />
             <input 
                type="text" 
                name="q" 
                defaultValue={searchQ} 
                placeholder="Cari nama kelas..." 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00C9A7] outline-none"
             />
           </div>

           {/* Kotak Sortir & Tombol Submit */}
           <div className="flex gap-2 w-full md:w-auto">
             <select 
               name="sort" 
               defaultValue={sortFilter} 
               className="flex-1 md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#00C9A7]"
             >
               <option value="terbaru">Terbaru Dibuat</option>
               <option value="terlama">Paling Lama</option>
               <option value="harga-tinggi">Harga Termahal</option>
               <option value="harga-rendah">Harga Termurah</option>
             </select>
             <button type="submit" className="bg-[#00C9A7] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00b596] transition-colors whitespace-nowrap">
                Terapkan
             </button>
           </div>
        </form>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Informasi Kelas</th>
              <th className="px-6 py-4">Kategori & Sub</th>
              <th className="px-6 py-4">Statistik</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!courses || courses.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada kelas yang ditemukan.</td>
                </tr>
            ) : courses.map((course: any) => (
              <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {course.thumbnail_url ? (
                        <Image src={course.thumbnail_url} alt="cover" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">No Img</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 max-w-[200px] truncate">{course.title}</h3>
                      <p className="text-xs text-[#00C9A7] font-bold mt-1">
                        {course.price > 0 ? `Rp ${course.price.toLocaleString("id-ID")}` : "Gratis"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-gray-900 font-semibold text-xs">
                        {course.main_categories?.name || "Kategori belum diatur"}
                     </span>
                     <span className="text-gray-400 text-[11px] font-medium">
                        {course.sub_categories?.name || "-"}
                     </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                        <LayoutList size={14} className="text-gray-400"/> {course.chapters?.length || 0} Bab/Modul
                     </span>
                     <span className="text-[11px] font-bold bg-orange-50 text-[#F97316] px-2 py-0.5 rounded w-max uppercase">
                        {course.course_levels?.name || "BELUM DIATUR"}
                     </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                   {course.is_published ? (
                     <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md w-max">
                        <Eye size={14} /> Terpublikasi
                     </span>
                   ) : (
                     <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md w-max">
                        <EyeOff size={14} /> Draft
                     </span>
                   )}
                </td>

                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/courses/${course.id}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-[#00C9A7] hover:bg-teal-50 rounded-lg transition"
                  >
                    <Edit3 size={16} /> Edit
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}