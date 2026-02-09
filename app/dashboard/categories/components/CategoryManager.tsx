"use client";

import { useState } from "react";
import { Trash2, Plus, Tag, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createCategory, deleteCategory } from "../actions";

export default function CategoryManager({ categories }: { categories: any[] }) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle Tambah
  async function handleAdd(formData: FormData) {
    setIsLoading(true);
    const res = await createCategory(formData);
    if (res?.error) {
        toast.error(res.error);
    } else {
        toast.success("Kategori berhasil ditambah");
        // Reset form manual jika perlu, atau biarkan refresh server action
        (document.getElementById("addForm") as HTMLFormElement)?.reset();
    }
    setIsLoading(false);
  }

  // Handle Hapus
  async function handleDelete(id: string) {
    if(!confirm("Yakin hapus kategori ini?")) return;

    const formData = new FormData();
    formData.append("id", id);

    const res = await deleteCategory(formData);
    if (res?.error) {
        toast.error(res.error); // Muncul jika kategori sedang dipakai
    } else {
        toast.success("Kategori dihapus");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Tambah */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-[#00C9A7]" /> Tambah Baru
            </h3>
            <form id="addForm" action={handleAdd} className="space-y-4">
                <input 
                    name="name" 
                    required 
                    placeholder="Nama Kategori (misal: Plumbing)" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm"
                    disabled={isLoading}
                />
                <button 
                    disabled={isLoading}
                    className="w-full py-2 bg-[#00C9A7] text-white font-bold rounded-lg text-sm hover:bg-[#00b894] flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : "Simpan"}
                </button>
            </form>
          </div>
        </div>

        {/* List Kategori */}
        <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Nama Kategori</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories?.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50/50 group">
                                <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                                    <Tag size={14} className="text-gray-400" /> {cat.name}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-red-300 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"
                                        title="Hapus Kategori"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories?.length === 0 && (
                    <p className="p-8 text-center text-gray-400 text-sm">Belum ada kategori.</p>
                )}
            </div>
        </div>
      </div>
  );
}