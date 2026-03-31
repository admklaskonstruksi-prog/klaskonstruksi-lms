import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, BookOpen } from "lucide-react";
import CourseTableClient from "./CourseTableClient";

export const dynamic = 'force-dynamic';

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

  if (sortFilter === "terbaru") query = query.order("created_at", { ascending: false });
  if (sortFilter === "terlama") query = query.order("created_at", { ascending: true });
  if (sortFilter === "harga-tinggi") query = query.order("price", { ascending: false });
  if (sortFilter === "harga-rendah") query = query.order("price", { ascending: true });

  let { data: courses, error } = await query;
  if (error) console.error("Error mengambil data kelas:", error);

  const { data: allReviews } = await supabase
    .from("reviews")
    .select("item_id, rating")
    .eq("item_type", "course");

  if (courses) {
      if (sortFilter === "cat_asc") courses.sort((a, b) => (a.main_categories?.name || "").localeCompare(b.main_categories?.name || ""));
      if (sortFilter === "cat_desc") courses.sort((a, b) => (b.main_categories?.name || "").localeCompare(a.main_categories?.name || ""));
      if (sortFilter === "sub_asc") courses.sort((a, b) => (a.sub_categories?.name || "").localeCompare(b.sub_categories?.name || ""));
      if (sortFilter === "sub_desc") courses.sort((a, b) => (b.sub_categories?.name || "").localeCompare(a.sub_categories?.name || ""));
      if (sortFilter === "status_asc") courses.sort((a, b) => (a.is_published === b.is_published ? 0 : a.is_published ? -1 : 1));
      if (sortFilter === "status_desc") courses.sort((a, b) => (a.is_published === b.is_published ? 0 : a.is_published ? 1 : -1));
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kelola Katalog</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar semua kelas, e-book, kategori, dan status publikasi.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/courses/create" className="bg-[#00C9A7] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00b596] transition-colors shadow-lg shadow-[#00C9A7]/20">
            <Plus size={18} /> Buat Kelas Baru
          </Link>
          <Link href="/dashboard/ebooks/create" className="bg-[#F97316] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#ea580c] transition-colors shadow-lg shadow-[#F97316]/20">
            <BookOpen size={18} /> Buat E-Book (PDF)
          </Link>
        </div>
      </div>

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

      <CourseTableClient courses={courses} allReviews={allReviews} sortFilter={sortFilter} searchQ={searchQ} />
      
    </div>
  );
}