"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition, useMemo } from "react";
import { Edit3, LayoutList, ChevronUp, ChevronDown, Star, CheckSquare, Square } from "lucide-react";
import PublishToggle from "./components/PublishToggle";
import RatingToggle from "../components/RatingToggle";
import { bulkUpdateCourseStatus, bulkUpdateDummyRating } from "./actions";
import toast from "react-hot-toast";

export default function CourseTableClient({ courses, allReviews, sortFilter, searchQ }: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // STATE UNTUK SORTING LOKAL
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

  const handleSelectAll = () => {
    if (selectedIds.length === courses.length) setSelectedIds([]);
    else setSelectedIds(courses.map((c: any) => c.id));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const handleBulkStatus = (status: boolean) => {
    startTransition(async () => {
      const res = await bulkUpdateCourseStatus(selectedIds, status);
      if (res?.error) toast.error(res.error);
      else { toast.success(`Status ${selectedIds.length} kelas berhasil diubah!`); setSelectedIds([]); }
    });
  };

  const handleBulkRating = (useDummy: boolean) => {
    startTransition(async () => {
      const res = await bulkUpdateDummyRating(selectedIds, useDummy);
      if (res?.error) toast.error(res.error);
      else { toast.success(`Rating mode ${selectedIds.length} kelas berhasil diubah!`); setSelectedIds([]); }
    });
  };

  // LOGIKA PENGURUTAN (SORTING)
  const sortedCourses = useMemo(() => {
    let sortableItems = [...(courses || [])];
    if (sortConfig.direction !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Penanganan Khusus untuk Relasi/Kategori
        if (sortConfig.key === 'category') {
          aValue = a.main_categories?.name || '';
          bValue = b.main_categories?.name || '';
        }
        // Penanganan Khusus untuk Status
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
  }, [courses, sortConfig]);

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

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
           <div className="font-bold text-teal-800 flex items-center gap-2">
             <CheckSquare size={18} /> {selectedIds.length} Kelas Dipilih
           </div>
           <div className="flex flex-wrap gap-2">
              <button disabled={isPending} onClick={() => handleBulkStatus(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 shadow-sm disabled:opacity-50">Jadikan Aktif</button>
              <button disabled={isPending} onClick={() => handleBulkStatus(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 shadow-sm disabled:opacity-50">Jadikan Draft</button>
              <button disabled={isPending} onClick={() => handleBulkRating(true)} className="px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-100 shadow-sm disabled:opacity-50">Pakai Rating Dummy</button>
              <button disabled={isPending} onClick={() => handleBulkRating(false)} className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 shadow-sm disabled:opacity-50">Pakai Rating Asli</button>
           </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 w-12 text-center cursor-pointer" onClick={handleSelectAll}>
                {selectedIds.length === courses.length && courses.length > 0 ? <CheckSquare size={18} className="text-[#00C9A7]" /> : <Square size={18} className="text-gray-400 hover:text-gray-600" />}
              </th>
              <th className="px-4 py-4"><SortableHeader label="Informasi Kelas" sortKey="title" /></th>
              <th className="px-6 py-4"><SortableHeader label="Kategori" sortKey="category" /></th>
              <th className="px-6 py-4">Statistik</th>
              <th className="px-6 py-4"><SortableHeader label="Status" sortKey="status" /></th>
              <th className="px-6 py-4">Mode Rating</th>
              <th className="px-6 py-4 text-right uppercase tracking-wider text-[11px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedCourses.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada kelas yang ditemukan.</td>
                </tr>
            ) : sortedCourses.map((course: any) => {
              const isSelected = selectedIds.includes(course.id);
              const ratings = allReviews?.filter((r: any) => r.item_id === course.id).map((r: any) => r.rating) || [];
              const realAvg = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : "0";

              return (
              <tr key={course.id} className={`${isSelected ? 'bg-teal-50/30' : 'hover:bg-gray-50/50'} transition-colors`}>
                <td className="px-6 py-4 text-center cursor-pointer" onClick={() => toggleSelect(course.id)}>
                   {isSelected ? <CheckSquare size={18} className="text-[#00C9A7]" /> : <Square size={18} className="text-gray-300" />}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
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
                    <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2 py-1 rounded w-max">
                        {course.main_categories?.name || "Belum diatur"}
                    </span>
                    <span className="text-gray-500 font-medium text-[10px]">
                        {course.sub_categories?.name || "-"}
                    </span>
                  </div>
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
                    <PublishToggle courseId={course.id} isPublished={course.is_published} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <RatingToggle id={course.id} initialUseDummy={course.use_dummy_rating} tableName="courses" />
                    <div className="text-[10px] text-gray-500">
                      Asli: <span className="font-bold text-gray-800">{realAvg} <Star size={10} className="inline text-yellow-400 fill-current -mt-0.5" /></span> | Dummy: {course.dummy_rating}
                    </div>
                  </div>
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
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}