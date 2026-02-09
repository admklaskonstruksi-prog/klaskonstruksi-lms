"use client";

import { useState } from "react";
import { createNewCourse } from "./actions";
import { ArrowRight, Loader2, Upload, BookOpen } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

export default function CreateCourseForm({ categories }: { categories: Category[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Fungsi preview gambar sebelum upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await createNewCourse(formData);

    if (result?.error) {
      alert("Error: " + result.error);
      setIsLoading(false);
    } 
    // Jika sukses, dia akan redirect otomatis
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* SECTION 1: Detail Utama */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <h3 className="font-semibold text-gray-900 border-b pb-4 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-gray-400"/>
          Detail Kelas
        </h3>

        {/* Upload Cover */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Kelas (Thumbnail)</label>
          <div className="flex items-start gap-6">
            <div className="w-40 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
              {preview ? (
                <Image src={preview} alt="Preview" fill className="object-cover" />
              ) : (
                <Upload className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-2">Disarankan ukuran 1280x720px (Format: JPG, PNG).</p>
            </div>
          </div>
        </div>

        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kelas</label>
          <input name="title" required type="text" placeholder="Contoh: Mekanika Teknik Dasar" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        {/* Kategori & Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select name="category_id" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white">
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select name="level" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white">
              <option value="Beginner">Pemula</option>
              <option value="Intermediate">Menengah</option>
              <option value="Advanced">Mahir</option>
            </select>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
          <textarea name="description" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Jelaskan detail kelas..." />
        </div>
      </div>

      {/* SECTION 2: Pengaturan Jual */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        
        {/* Harga */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Harga Kelas</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 font-medium">Rp</span>
            <input name="price" type="number" placeholder="0" className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Isi 0 jika kelas ini Gratis.</p>
        </div>

        {/* Status Publish */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <h4 className="font-medium text-gray-900">Langsung Tayangkan?</h4>
            <p className="text-xs text-gray-500">Jika aktif, siswa bisa langsung melihat kelas ini setelah disimpan.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="is_published" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Menyimpan...
            </>
          ) : (
            <>
              Lanjut ke Materi
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

    </form>
  );
}