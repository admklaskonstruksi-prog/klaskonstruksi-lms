'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, BookOpen, Target, Star, Plus, Trash2, FileText } from 'lucide-react';

export default function CreateEbookPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  
  // State untuk dinamic input Keypoints
  const [keypoints, setKeypoints] = useState<string[]>(['']);

  const handleAddKeypoint = () => setKeypoints([...keypoints, '']);
  const handleRemoveKeypoint = (index: number) => {
    const newKp = [...keypoints];
    newKp.splice(index, 1);
    setKeypoints(newKp);
  };
  const handleKeypointChange = (index: number, value: string) => {
    const newKp = [...keypoints];
    newKp[index] = value;
    setKeypoints(newKp);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      // Cek apakah data berhasil ditangkap (Bisa dilihat di Inspect Element -> Console browser)
      console.log("Judul E-Book:", formData.get('title'));
      console.log("Keypoints:", formData.getAll('keypoints'));

      // 1. TODO: Di sini nanti tempat memanggil Action/API Supabase Anda
      // const result = await createEbookAction(formData);

      // 2. Simulasi loading 1 detik agar animasi tombol terlihat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Tombol berfungsi! Data siap dikirim ke Supabase.");
      
      // 3. Pindah ke halaman Daftar E-Book (pastikan file app/dashboard/ebooks/page.tsx sudah Anda buat)
      router.push('/dashboard/ebooks'); 

    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat E-Book Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Detail E-Book */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 border-b pb-4 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-gray-400"/>
            Detail E-Book
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Judul E-Book</label>
            <input 
              type="text" 
              name="title" 
              required 
              placeholder="Contoh: Panduan Dasar Konstruksi" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File PDF E-Book</label>
            <input 
              type="file" 
              name="pdf_file" 
              accept="application/pdf" 
              required 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer border border-gray-300 rounded-lg p-2" 
            />
          </div>
        </div>

        {/* SECTION 2: Goals & Keypoints */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 border-b pb-4 mb-4 flex items-center gap-2">
            <Target size={20} className="text-gray-400"/>
            Tujuan & Poin Utama
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Goals</label>
            <textarea 
              name="goals" 
              rows={3} 
              placeholder="Siap terjun ke proyek..." 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keypoints</label>
            <div className="space-y-3">
              {keypoints.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input 
                    type="text" 
                    name="keypoints" 
                    value={point}
                    onChange={(e) => handleKeypointChange(index, e.target.value)}
                    placeholder="Paham dasar proyek..."
                    required
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  {keypoints.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveKeypoint(index)}
                      className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={handleAddKeypoint}
              className="mt-4 flex items-center text-sm text-green-600 font-semibold hover:text-green-700 transition-colors"
            >
              <Plus size={16} className="mr-1" /> Tambah Poin Baru
            </button>
          </div>
        </div>

        {/* SECTION 3: Harga & Social Proof */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 border-b pb-4 mb-4 flex items-center gap-2">
            <Star size={20} className="text-gray-400"/>
            Harga & Social Proof
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harga E-Book</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-medium">Rp</span>
                <input 
                  name="price" 
                  type="number" 
                  required
                  placeholder="0" 
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Isi 0 jika E-Book ini dibagikan gratis.</p>
            </div>

            {/* Kotak Social Proof */}
            <div>
              <div className="border border-orange-200 bg-orange-50 rounded-xl p-5">
                <h4 className="text-sm font-bold text-orange-900 mb-1">Social Proof (Visual Opsional)</h4>
                <p className="text-xs text-orange-700 mb-4">Tampilkan angka ini untuk menarik minat pembeli.</p>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bintang</label>
                    <input type="number" step="0.1" name="bintang" defaultValue={4.6} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Jml Review</label>
                    <input type="number" name="jml_review" defaultValue={50} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Terjual</label>
                    <input type="number" name="terjual" defaultValue={33} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-4">
          <button 
            type="submit" 
            disabled={isUploading} 
            className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg disabled:opacity-70"
          >
            {isUploading ? <><Loader2 className="animate-spin w-5 h-5" /> Menyimpan...</> : <><ArrowRight size={18} /> Simpan E-Book</>}
          </button>
        </div>

      </form>
    </div>
  );
}