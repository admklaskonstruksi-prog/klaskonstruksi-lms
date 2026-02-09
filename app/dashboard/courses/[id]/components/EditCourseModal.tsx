"use client";

import { useState } from "react";
import { X, Loader2, Save, UploadCloud, Image as ImageIcon } from "lucide-react";
import { updateCourse } from "../../actions";
import toast from "react-hot-toast";
import Image from "next/image";

export default function EditCourseModal({ course, categories, onClose }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(course.thumbnail_url); // Preview gambar saat ini

  // Handle saat file dipilih untuk preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("id", course.id);
    
    try {
        const res = await updateCourse(formData);
        
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Kelas berhasil diperbarui!");
            window.location.reload(); 
        }
    } catch (error) {
        toast.error("Gagal menyimpan perubahan.");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h3 className="text-lg font-bold text-gray-900">Edit Kelas</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* --- INPUT COVER IMAGE --- */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Cover Image (Thumbnail)</label>
                <div className="flex gap-4 items-start">
                    {/* Preview Box */}
                    <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative shrink-0">
                        {previewUrl ? (
                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={20} />
                            </div>
                        )}
                    </div>
                    
                    {/* File Input */}
                    <div className="flex-1">
                        <input 
                            type="file" 
                            name="thumbnail" 
                            accept="image/*"
                            id="coverInput"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <label 
                            htmlFor="coverInput" 
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 cursor-pointer hover:border-[#00C9A7] hover:text-[#00C9A7] hover:bg-green-50 transition"
                        >
                            <UploadCloud size={16} /> Ganti Gambar
                        </label>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1">JPG, PNG (Max 2MB). Kosongkan jika tidak ingin mengubah.</p>
                    </div>
                </div>
            </div>

            {/* Nama Kelas */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nama Kelas</label>
                <input 
                    name="title" 
                    defaultValue={course.title}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Harga */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Harga (IDR)</label>
                    <input 
                        type="number"
                        name="price" 
                        defaultValue={course.price}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none"
                    />
                </div>

                {/* Kategori */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                    <select 
                        name="category_id"
                        defaultValue={course.category_id}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none bg-white"
                    >
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tingkat Kesulitan */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Tingkat Kesulitan</label>
                <select 
                    name="difficulty"
                    defaultValue={course.difficulty}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none bg-white"
                >
                    <option value="Beginner">Beginner (Pemula)</option>
                    <option value="Intermediate">Intermediate (Menengah)</option>
                    <option value="Advanced">Advanced (Mahir)</option>
                </select>
            </div>

            <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">
                    Batal
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-[#00C9A7] text-white font-bold rounded-xl hover:bg-[#00b894] flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Save size={18}/> Simpan</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}