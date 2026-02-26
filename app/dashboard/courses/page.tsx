import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit3, LayoutList, ChevronUp, ChevronDown } from "lucide-react";
import PublishToggle from "./components/PublishToggle";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  const sp = await searchParams;
  const searchQ = sp?.q || "";
  const sortFilter = sp?.sort || "terbaru";

  let query = supabase.from("courses").select(`
    *,
    main_categories!main_category_id ( id, name ),
    sub_categories!sub_category_id ( id, name ),
    course_levels!level_id ( id, name ), 
    chapters ( id )
  `);

  if (searchQ) query = query.ilike("title", `%${searchQ}%`);

  // Sorting Native Database
  if (sortFilter === "terbaru") query = query.order("created_at", { ascending: false });
  if (sortFilter === "terlama") query = query.order("created_at", { ascending: true });
  if (sortFilter === "harga-tinggi") query = query.order("price", { ascending: false });
  if (sortFilter === "harga-rendah") query = query.order("price", { ascending: true });

  let { data: courses, error } = await query;

  if (error) console.error("Error mengambil data kelas:", error);

  // Sorting Custom untuk Relasi Kategori & Status
  if (courses) {
      if (sortFilter === "cat_asc") courses.sort((a, b) => (a.main_categories?.name || "").localeCompare(b.main_categories?.name || ""));
      if (sortFilter === "cat_desc") courses.sort((a, b) => (b.main_categories?.name || "").localeCompare(a.main_categories?.name || ""));
      
      if (sortFilter === "sub_asc") courses.sort((a, b) => (a.sub_categories?.name || "").localeCompare(b.sub_categories?.name || ""));
      if (sortFilter === "sub_desc") courses.sort((a, b) => (b.sub_categories?.name || "").localeCompare(a.sub_categories?.name || ""));
      
      if (sortFilter === "status_asc") courses.sort((a, b) => (a.is_published === b.is_published ? 0 : a.is_published ? -1 : 1));
      if (sortFilter === "status_desc") courses.sort((a, b) => (a.is_published === b.is_published ? 0 : a.is_published ? 1 : -1));
  }

  // Komponen pembantu untuk Header Tabel yang bisa di-klik
  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => {
      const isAsc = sortFilter === `${sortKey}_asc`;
      const isDesc = sortFilter === `${sortKey}_desc`;
      const nextSort = isAsc ? `${sortKey}_desc` : `${sortKey}_asc`;

      return (
          <Link href={`?sort=${nextSort}&q=${searchQ}`} className="flex items-center gap-1.5 hover:text-gray-800 transition-colors group select-none">
              {label}
              <div className="flex flex-col opacity-50 group-hover:opacity-100 transition-opacity">
                  <ChevronUp size={12} className={`-mb-1 ${isAsc ? 'text-[#00C9A7] font-black' : 'text-gray-300'}`} />
                  <ChevronDown size={12} className={`${isDesc ? 'text-[#00C9A7] font-black' : 'text-gray-300'}`} />
              </div>
          </Link>
      );
  };

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

      {/* FILTER BAR PENCARIAN & HARGA */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <form method="GET" className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 flex items-center">
             <Search size={18} className="absolute left-4 text-gray-400" />
             <input type="text" name="q" defaultValue={searchQ} placeholder="Cari nama kelas..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00C9A7] outline-none" />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
             <select name="sort" defaultValue={sortFilter} className="flex-1 md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#00C9A7]">
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
              <th className="px-6 py-4"><SortableHeader label="Kategori Utama" sortKey="cat" /></th>
              <th className="px-6 py-4"><SortableHeader label="Sub Kategori" sortKey="sub" /></th>
              <th className="px-6 py-4">Statistik</th>
              <th className="px-6 py-4"><SortableHeader label="Status" sortKey="status" /></th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!courses || courses.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada kelas yang ditemukan.</td>
                </tr>
            ) : courses.map((course: any) => (
              <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                      {course.thumbnail_url ? (
                        <Image src={course.thumbnail_url} alt="cover" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">No Img</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 max-w-[220px] truncate">{course.title}</h3>
                      <p className="text-xs text-[#00C9A7] font-bold mt-1">
                        {course.price > 0 ? `Rp ${course.price.toLocaleString("id-ID")}` : "Gratis"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                    <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2 py-1 rounded">
                       {course.main_categories?.name || "Belum diatur"}
                    </span>
                </td>

                <td className="px-6 py-4">
                    <span className="text-gray-500 font-medium text-xs">
                        {course.sub_categories?.name || "-"}
                    </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                     <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                        <LayoutList size={14} className="text-gray-400"/> {course.chapters?.length || 0} Bab/Modul
                     </span>
                     <span className="text-[10px] font-black bg-orange-50 text-[#F97316] px-2 py-0.5 rounded w-max uppercase tracking-wider border border-orange-100">
                        {course.course_levels?.name || "BELUM DIATUR"}
                     </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                    {/* KOMPONEN TOGGLE PUBLISH */}
                    <PublishToggle courseId={course.id} isPublished={course.is_published} />
                </td>

                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/courses/${course.id}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-[#00C9A7] bg-teal-50 hover:bg-[#00C9A7] hover:text-white rounded-lg transition-colors border border-teal-100"
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