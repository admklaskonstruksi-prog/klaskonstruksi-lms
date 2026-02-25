"use client";

import { useState } from "react";
import { Trash2, Plus, Tag, Loader2, Layers, ListTree, BarChart } from "lucide-react";
import toast from "react-hot-toast";
// Pastikan Anda memperbarui/membuat action ini di file actions.ts Anda nantinya
import { createMainCategory, deleteMainCategory, createSubCategory, deleteSubCategory, createLevel, deleteLevel } from "../actions";

export default function CategoryManager({ 
  mainCategories, 
  subCategories, 
  levels 
}: { 
  mainCategories: any[], 
  subCategories: any[], 
  levels: any[] 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "sub" | "level">("main");

  // Handle Tambah dinamis berdasarkan tab aktif
  async function handleAdd(formData: FormData) {
    setIsLoading(true);
    let res;
    
    if (activeTab === "main") res = await createMainCategory(formData);
    else if (activeTab === "sub") res = await createSubCategory(formData);
    else res = await createLevel(formData);

    if (res?.error) {
        toast.error(res.error);
    } else {
        toast.success("Data berhasil ditambah");
        (document.getElementById("addForm") as HTMLFormElement)?.reset();
    }
    setIsLoading(false);
  }

  // Handle Hapus dinamis berdasarkan tab aktif
  async function handleDelete(id: string) {
    if(!confirm("Yakin hapus data ini? Data yang terhubung mungkin akan ikut terhapus atau error.")) return;

    const formData = new FormData();
    formData.append("id", id);
    
    let res;
    if (activeTab === "main") res = await deleteMainCategory(formData);
    else if (activeTab === "sub") res = await deleteSubCategory(formData);
    else res = await deleteLevel(formData);

    if (res?.error) {
        toast.error(res.error);
    } else {
        toast.success("Data dihapus");
    }
  }

  // Data yang ditampilkan di tabel berdasarkan tab
  const activeData = activeTab === "main" ? mainCategories : activeTab === "sub" ? subCategories : levels;

  return (
    <div className="space-y-6">
      {/* Tabs Navigasi */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button onClick={() => setActiveTab("main")} className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg ${activeTab === "main" ? "text-[#00C9A7] border-b-2 border-[#00C9A7]" : "text-gray-500 hover:text-gray-700"}`}>
            <Layers size={18} /> Main Kategori
        </button>
        <button onClick={() => setActiveTab("sub")} className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg ${activeTab === "sub" ? "text-[#00C9A7] border-b-2 border-[#00C9A7]" : "text-gray-500 hover:text-gray-700"}`}>
            <ListTree size={18} /> Sub Kategori
        </button>
        <button onClick={() => setActiveTab("level")} className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg ${activeTab === "level" ? "text-[#00C9A7] border-b-2 border-[#00C9A7]" : "text-gray-500 hover:text-gray-700"}`}>
            <BarChart size={18} /> Level Kelas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Tambah */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-[#00C9A7]" /> Tambah {activeTab === "main" ? "Main Kategori" : activeTab === "sub" ? "Sub Kategori" : "Level"}
            </h3>
            <form id="addForm" action={handleAdd} className="space-y-4">
                
                {/* Khusus Tab Sub Kategori, munculkan dropdown Main Kategori */}
                {activeTab === "sub" && (
                    <select name="main_category_id" required className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white">
                        <option value="">-- Pilih Main Kategori --</option>
                        {mainCategories?.map(main => (
                            <option key={main.id} value={main.id}>{main.name}</option>
                        ))}
                    </select>
                )}

                <input 
                    name="name" 
                    required 
                    placeholder={`Nama ${activeTab === "main" ? "Kategori (ex: Construction)" : activeTab === "sub" ? "Sub (ex: Project Management)" : "Level (ex: Beginner)"}`} 
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

        {/* List Data */}
        <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Nama</th>
                            {activeTab === "sub" && <th className="px-6 py-4">Induk (Main)</th>}
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {activeData?.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 group">
                                <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                                    <Tag size={14} className="text-gray-400" /> {item.name}
                                </td>
                                {activeTab === "sub" && (
                                    <td className="px-6 py-4 text-gray-500">
                                        {/* Menampilkan nama main category dari relasi database */}
                                        {item.main_categories?.name || "Unknown"}
                                    </td>
                                )}
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-300 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"
                                        title="Hapus"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!activeData || activeData.length === 0) && (
                    <p className="p-8 text-center text-gray-400 text-sm">Belum ada data.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}