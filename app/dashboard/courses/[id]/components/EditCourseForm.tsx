"use client";

import { useState } from "react";
import { updateCourseDetails } from "../actions";
import { Loader2, Save, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  level: string | null;
  category_id: string | null;
  is_published: boolean;
  thumbnail_url: string | null;
}

export default function EditCourseForm({ course, categories }: { course: CourseData; categories: Category[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(course.thumbnail_url);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.append("courseId", course.id);
    formData.append("old_thumbnail_url", course.thumbnail_url || "");

    const result = await updateCourseDetails(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Detail kelas berhasil diperbarui!");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Edit Informasi Kelas</h3>
        <button type="submit" disabled={isLoading} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50">
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: Cover Image */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Cover Kelas</label>
           <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 group hover:border-blue-500 transition-colors">
              {preview ? (
                <Image src={preview} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ImageIcon size={40} />
                </div>
              )}
              
              {/* Overlay Upload */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100">
                    <Upload size={16} /> Ganti Gambar
                    <input type="file" name="thumbnail" accept="image/*" className="hidden" onChange={handleImageChange} />
                 </label>
              </div>
           </div>
           <p className="text-xs text-gray-400 mt-2">Format: JPG/PNG. Ukuran rekomen: 1280x720px.</p>
        </div>

        {/* KOLOM KANAN: Form Inputs */}
        <div className="space-y-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kelas</label>
              <input name="title" defaultValue={course.title} required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select name="category_id" defaultValue={course.category_id || ""} className="w-full px-4 py-2 border rounded-lg bg-white">
                  <option value="">-- Pilih --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select name="level" defaultValue={course.level || "Beginner"} className="w-full px-4 py-2 border rounded-lg bg-white">
                  <option value="Beginner">Pemula</option>
                  <option value="Intermediate">Menengah</option>
                  <option value="Advanced">Mahir</option>
                </select>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input name="price" type="number" defaultValue={course.price} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
               </div>
               <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" name="is_published" defaultChecked={course.is_published} id="pub" className="w-5 h-5 text-green-600 rounded focus:ring-green-500" />
                  <label htmlFor="pub" className="text-sm font-medium text-gray-700 cursor-pointer">Tayangkan Publik?</label>
               </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea name="description" rows={3} defaultValue={course.description || ""} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
           </div>
        </div>

      </div>
    </form>
  );
}