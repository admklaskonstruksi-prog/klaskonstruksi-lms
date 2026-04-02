"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Edit3, BookOpen, Star, Plus, ChevronUp, ChevronDown } from "lucide-react";
import RatingToggle from "../components/RatingToggle";
import EbookPublishToggle from "./components/EbookPublishToggle";
import { useState, useEffect, useMemo } from "react";

// Karena kita butuh fitur klik/sorting di Client Side, file ini diubah jadi "use client"
export default function AdminEbooksPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState("");
  
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

  useEffect(() => {
    fetchEbooks();
    fetchReviews();
  }, [searchQ]);

  const fetchEbooks = async () => {
    let query = supabase.from("ebooks").select('*').order('created_at', { ascending: false });
    if (searchQ) query = query.ilike("title", `%${searchQ}%`);
    const { data } = await query;
    if (data) setEbooks(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from("reviews").select("item_id, rating").eq("item_type", "ebook");
    if (data) setAllReviews(data);
  };

  // LOGIKA PENGURUTAN (SORTING)
  const sortedEbooks = useMemo(() => {
    let sortableItems = [...(ebooks || [])];
    if (sortConfig.direction !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'status') {
          aValue = a.is_published ? 1 : 0;
          bValue = b.is_published ? 1 : 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [ebooks, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => {
    const isAsc = sortConfig.key === sortKey && sortConfig.direction === 'asc';
    const isDesc = sortConfig.key === sortKey && sortConfig.direction === 'desc';

    return (
      <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1.5 hover:text-gray-800 transition-colors group select-none font-bold uppercase tracking-wider text-[11px]">
        {label}
        <div className="flex flex-col opacity-50 group-hover:opacity-100 transition-opacity">
          <ChevronUp size={12} className={`-mb-1 ${isAsc ? 'text-[#00C9A7] font-black' : 'text-gray-300'}`} />
          <ChevronDown size={12} className={`${isDesc ? 'text-[#00C9A7] font-black' : 'text-gray-300'}`} />
        </div>
      </button>
    );
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchQ(formData.get('q') as string);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kelola E-Book</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar semua e-book, harga, dan pengaturan rating.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/ebooks/create" className="bg-[#F97316] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#ea580c] transition-colors shadow-lg shadow-[#F97316]/20">
            <Plus size={18} /> Buat E-Book Baru
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 flex items-center">
             <Search size={18} className="absolute left-4 text-gray-400" />
             <input type="text" name="q" defaultValue={searchQ} placeholder="Cari judul e-book..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00C9A7] outline-none" />
           </div>
           <button type="submit" className="bg-[#00C9A7] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00b596] transition-colors whitespace-nowrap">
             Cari E-Book
           </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4"><SortableHeader label="Informasi E-Book" sortKey="title" /></th>
              <th className="px-6 py-4"><SortableHeader label="Terjual" sortKey="sold_count" /></th>
              <th className="px-6 py-4"><SortableHeader label="Status" sortKey="status" /></th>
              <th className="px-6 py-4">Mode Rating</th>
              <th className="px-6 py-4 text-right uppercase tracking-wider text-[11px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!sortedEbooks || sortedEbooks.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada e-book yang ditemukan.</td>
                </tr>
            ) : sortedEbooks.map((ebook: any) => {
              
              const ratings = allReviews?.filter((r: any) => r.item_id === ebook.id).map((r: any) => r.rating) || [];
              const realAvg = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : "0";

              return (
              <tr key={ebook.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-16 bg-teal-50 rounded overflow-hidden flex-shrink-0 border border-teal-100 flex items-center justify-center">
                        <BookOpen size={24} className="text-[#00C9A7]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 max-w-[250px] truncate">{ebook.title}</h3>
                      <p className="text-xs text-[#00C9A7] font-bold mt-1">
                        {ebook.price > 0 ? `Rp ${ebook.price.toLocaleString("id-ID")}` : "Gratis"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-gray-900 font-bold text-xs bg-gray-100 px-3 py-1.5 rounded-full w-max">
                     {ebook.sold_count || 0} Lisensi
                  </span>
                </td>

                <td className="px-6 py-4">
                  <EbookPublishToggle ebookId={ebook.id} isPublished={ebook.is_published} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <RatingToggle id={ebook.id} initialUseDummy={ebook.use_dummy_rating} tableName="ebooks" />
                    <div className="text-[10px] text-gray-500">
                      Asli: <span className="font-bold text-gray-800">{realAvg} <Star size={10} className="inline text-yellow-400 fill-current -mt-0.5" /></span> | Dummy: {ebook.dummy_rating}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/ebooks/${ebook.id}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-[#00C9A7] bg-teal-50 hover:bg-[#00C9A7] hover:text-white rounded-lg transition-colors border border-teal-100"
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