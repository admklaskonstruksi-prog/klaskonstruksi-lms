"use client";
export const runtime = 'edge';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookText, ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { createEbookAction } from "./actions";
import toast from "react-hot-toast";

export default function CreateEbookPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [keypoints, setKeypoints] = useState<string[]>([""]);

  const addKeypoint = () => setKeypoints([...keypoints, ""]);
  
  const removeKeypoint = (index: number) => {
    if (keypoints.length > 1) {
      const newKeypoints = keypoints.filter((_, i) => i !== index);
      setKeypoints(newKeypoints);
    }
  };

  const updateKeypoint = (text: string, index: number) => {
    const newKeypoints = [...keypoints];
    newKeypoints[index] = text;
    setKeypoints(newKeypoints);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    toast.loading("Mengunggah E-Book... Harap tunggu, proses ini bisa memakan waktu jika file besar.");

    try {
      const formData = new FormData(e.currentTarget);
      
      const result = await createEbookAction(formData);

      toast.dismiss();

      if (result?.error) {
        toast.error(result.error);
        alert("Error: " + result.error);
      } else {
        toast.success("E-Book berhasil diterbitkan!");
        router.push("/dashboard/ebooks");
        router.refresh();
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("Terjadi kesalahan:", error);
      toast.error("Terjadi kesalahan. Cek console.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto font-sans selection:bg-[#00C9A7] selection:text-white">
      <Link href="/dashboard/ebooks" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00C9A7] transition-colors mb-6 font-bold">
        <ArrowLeft size={16} /> Kembali ke Daftar E-Book
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <BookText className="text-[#00C9A7]" size={32} />
          Terbitkan E-Book Baru
        </h1>
        <p className="text-gray-500 mt-2">Isi detail lengkap e-book dan unggah file PDF yang ingin Anda jual.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8">
        
        {/* INFORMASI DASAR */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Informasi Dasar</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul E-Book</label>
            <input 
              type="text" 
              name="title" 
              required 
              placeholder="Contoh: Panduan Sukses Project Manager 2026"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-gray-50 focus:bg-white text-gray-900 font-medium" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Harga Jual (Rp)</label>
              <input 
                type="number" 
                name="price" 
                required 
                placeholder="Contoh: 99000 (Isi 0 jika gratis)"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-gray-50 focus:bg-white text-gray-900 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Angka Dummy Terjual (Opsional)</label>
              <input 
                type="number" 
                name="terjual" 
                defaultValue={0}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-gray-50 focus:bg-white text-gray-900 font-medium" 
              />
            </div>
          </div>
        </div>

        {/* DETAIL PEMBELAJARAN */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
           <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Detail Pembelajaran</h2>
           
           <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tujuan / Deskripsi Utama (Your Goals)</label>
              <textarea 
                 name="goals" 
                 required 
                 rows={4}
                 placeholder="Jelaskan apa yang akan didapatkan pembaca dari e-book ini..."
                 className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-gray-50 focus:bg-white text-gray-900 font-medium" 
              ></textarea>
           </div>

           <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Poin Utama (Key Points)</label>
              <div className="space-y-3">
                 {keypoints.map((pt, idx) => (
                    <div key={idx} className="flex gap-3">
                       <input 
                         type="text" 
                         name="keypoints" 
                         value={pt}
                         onChange={(e) => updateKeypoint(e.target.value, idx)}
                         placeholder={`Poin pembelajaran ke-${idx + 1}`}
                         required
                         className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-gray-50 focus:bg-white text-gray-900 font-medium" 
                       />
                       {keypoints.length > 1 && (
                          <button type="button" onClick={() => removeKeypoint(idx)} className="px-4 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition">
                             <Trash2 size={20} />
                          </button>
                       )}
                    </div>
                 ))}
              </div>
              <button type="button" onClick={addKeypoint} className="mt-3 text-[#F97316] text-sm font-bold flex items-center gap-1 hover:underline">
                 <Plus size={16} /> Tambah Poin Baru
              </button>
           </div>
        </div>

        {/* UPLOAD FILES */}
        <div className="space-y-6 pt-6 border-t border-gray-100 bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
          <h2 className="text-xl font-bold text-gray-900 border-b border-teal-100 pb-2">Unggah File</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">File E-Book (Wajib PDF)</label>
              <input 
                type="file" 
                name="pdf_file" 
                accept="application/pdf" 
                required 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00C9A7] file:text-white hover:file:bg-[#00b596] transition-all cursor-pointer border border-gray-200 rounded-xl p-2 bg-white" 
              />
              <p className="text-xs text-gray-500 mt-2">Maksimal ukuran file: 50MB.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cover E-Book (Gambar JPG/PNG)</label>
              <input 
                type="file" 
                name="cover_image" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                required 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#F97316] file:text-white hover:file:bg-[#ea580c] transition-all cursor-pointer border border-gray-200 rounded-xl p-2 bg-white" 
              />
              <p className="text-xs text-gray-500 mt-2">Rekomendasi rasio: 3:4 (Portrait).</p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className="w-full bg-[#00C9A7] text-white py-4 rounded-xl font-black text-lg hover:bg-[#00b596] transition-all shadow-lg shadow-[#00C9A7]/30 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
        >
          {isUploading ? <><Loader2 className="animate-spin" size={24} /> Sedang Menyimpan...</> : <><Save size={24} /> Terbitkan E-Book</>}
        </button>

      </form>
    </div>
  );
}