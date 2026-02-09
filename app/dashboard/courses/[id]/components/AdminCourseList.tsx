"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings, Trash2, Search, Video, Edit3 } from "lucide-react";
import { deleteCourse } from "../../actions";
import toast from "react-hot-toast";
import EditCourseModal from "./EditCourseModal";

export default function AdminCourseList({ courses, categories }: { courses: any[], categories: any[] }) {
  const [items, setItems] = useState(courses);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null); // State untuk modal edit

  // Filter Search
  const filteredItems = items.filter((c) => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus kelas ini? Data materi & siswa akan hilang permanen!")) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("id", id);

    try {
        const res = await deleteCourse(formData);
        
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Kelas berhasil dihapus");
            setItems(prev => prev.filter(item => item.id !== id));
        }
    } catch (error) {
        toast.error("Gagal menghapus kelas");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Search Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Cari judul kelas..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7] bg-white transition"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="text-sm text-gray-500 font-bold bg-white px-4 py-2 rounded-lg border border-gray-200">
                Total: {filteredItems.length} Kelas
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Info Kelas</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Harga</th>
                        <th className="px-6 py-4">Kesulitan</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50/50 group transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 relative bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                        {course.thumbnail_url ? (
                                            <Image src={course.thumbnail_url} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Img</div>
                                        )}
                                    </div>
                                    <div>
                                        {/* ID DIHAPUS DARI SINI SESUAI REQUEST */}
                                        <div className="font-bold text-gray-900 line-clamp-1 max-w-[200px] text-base">{course.title}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                                    {course.categories?.name || "Umum"}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-700">
                                {course.price === 0 ? "GRATIS" : `Rp ${(course.price / 1000).toLocaleString()}k`}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                                    {course.difficulty || "-"}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Tombol Edit Info (Modal) */}
                                    <button 
                                        onClick={() => setEditingCourse(course)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition border border-blue-100"
                                        title="Edit Info Kelas"
                                    >
                                        <Edit3 size={16} />
                                    </button>

                                    {/* Tombol Kelola Materi (Link) */}
                                    <Link 
                                        href={`/dashboard/courses/${course.id}`} 
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition border border-green-100"
                                        title="Kelola Video & Materi"
                                    >
                                        <Video size={16} />
                                    </Link>
                                    
                                    {/* Tombol Hapus */}
                                    <button 
                                        onClick={() => handleDelete(course.id)}
                                        disabled={isLoading}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-100"
                                        title="Hapus Kelas"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {filteredItems.length === 0 && (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                    <Search className="w-10 h-10 mb-2 opacity-20" />
                    <p>Tidak ada kelas yang ditemukan.</p>
                </div>
            )}
        </div>
        </div>

        {/* Render Modal jika ada course yang diedit */}
        {editingCourse && (
            <EditCourseModal 
                course={editingCourse} 
                categories={categories}
                onClose={() => {
                    setEditingCourse(null);
                    // Opsi: Reload window untuk refresh data list, atau gunakan router.refresh()
                    window.location.reload(); 
                }} 
            />
        )}
    </>
  );
}