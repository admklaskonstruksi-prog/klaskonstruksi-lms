export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Edit3, BookOpen, Star, Plus } from "lucide-react";
import RatingToggle from "../components/RatingToggle";
import EbookPublishToggle from "./components/EbookPublishToggle";

export default async function AdminEbooksPage({ searchParams }: { searchParams?: Promise<any> | any }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  const sp = await searchParams;
  const searchQ = sp?.q || "";

  // Mengambil data ebooks beserta rating aslinya
  let query = supabase.from("ebooks").select(`
    *,
    reviews ( rating )
  `).order('created_at', { ascending: false });

  if (searchQ) query = query.ilike("title", `%${searchQ}%`);

  let { data: ebooks, error } = await query;

  if (error) console.error("Error mengambil data ebook:", error);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kelola E-Book</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar semua e-book, harga, dan pengaturan rating.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/ebooks/create" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Plus size={18} /> Buat E-Book Baru
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <form method="GET" className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 flex items-center">
             <Search size={18} className="absolute left-4 text-gray-400" />
             <input type="text" name="q" defaultValue={searchQ} placeholder="Cari judul e-book..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
           <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
              Cari E-Book
           </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Informasi E-Book</th>
              <th className="px-6 py-4">Terjual</th>
              <th className="px-6 py-4">Status</th> {/* Header Status Baru */}
              <th className="px-6 py-4">Mode Rating</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!ebooks || ebooks.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada e-book yang ditemukan.</td>
                </tr>
            ) : ebooks.map((ebook: any) => {
              
              // Menghitung rata-rata rating asli
              const ratings = ebook.reviews?.map((r: any) => r.rating) || [];
              const realAvg = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : "0";

              return (
              <tr key={ebook.id} className="hover:bg-gray-50/50 transition-colors">
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-16 bg-blue-50 rounded overflow-hidden flex-shrink-0 border border-blue-100 flex items-center justify-center">
                        <BookOpen size={24} className="text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 max-w-[250px] truncate">{ebook.title}</h3>
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        {ebook.price > 0 ? `Rp ${ebook.price.toLocaleString("id-ID")}` : "Gratis"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full text-xs">
                     {ebook.sold_count || 0} Pembelian
                  </span>
                </td>

                {/* Kolom Status (Publish Toggle) Baru */}
                <td className="px-6 py-4">
                  <EbookPublishToggle ebookId={ebook.id} isPublished={ebook.is_published} />
                </td>

                {/* Kolom Mode Rating */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    {/* Perhatikan prop tableName="ebooks" */}
                    <RatingToggle id={ebook.id} initialUseDummy={ebook.use_dummy_rating} tableName="ebooks" />
                    <div className="text-[10px] text-gray-500">
                      Asli: <span className="font-bold text-gray-800">{realAvg} <Star size={10} className="inline text-yellow-400 fill-current -mt-0.5" /></span> | Dummy: {ebook.dummy_rating}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/ebooks/${ebook.id}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-100"
                  >
                    <Edit3 size={16} /> Edit
                  </Link>
                </td>

              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}