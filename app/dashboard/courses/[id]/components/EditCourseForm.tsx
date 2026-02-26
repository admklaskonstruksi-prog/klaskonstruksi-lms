"use client";

import { useState } from "react";
import { saveCourseContent } from "../actions"; 
import { Loader2, Save, Upload, ImageIcon, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  goals: string | null;
  keypoints: string | null;
  price: number;
  strike_price?: number;
  rating?: number;        
  review_count?: number;  
  sales_count?: number;   
  is_published: boolean;
  thumbnail_url: string | null;
  level_id?: string;         // Sesuai DB
  main_category_id?: string; // Sesuai DB
  sub_category_id?: string;  // Sesuai DB
}

interface Props {
  course: CourseData;
  categories?: any[];
  subCategories?: any[];
  levels?: any[]; 
}

export default function EditCourseForm({ course, categories = [], subCategories = [], levels = [] }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(course.thumbnail_url);
  
  // State untuk filter Sub Kategori dinamis
  const [selectedMainCat, setSelectedMainCat] = useState(course.main_category_id || "");
  
  const router = useRouter();

  // Filter otomatis sub kategori
  const filteredSubCats = subCategories.filter(sub => sub.main_category_id === selectedMainCat);

  let initialKeypoints: string[] = [""];
  if (course.keypoints) {
    try {
      const parsed = JSON.parse(course.keypoints);
      if (Array.isArray(parsed) && parsed.length > 0) initialKeypoints = parsed;
    } catch (e) {
      initialKeypoints = course.keypoints.split('\n').filter(k => k.trim() !== "");
    }
  }
  if (initialKeypoints.length === 0) initialKeypoints = [""];

  const [keypointList, setKeypointList] = useState<string[]>(initialKeypoints);

  const addKeypoint = () => setKeypointList([...keypointList, ""]);
  const removeKeypoint = (index: number) => {
    const newList = [...keypointList];
    newList.splice(index, 1);
    if (newList.length === 0) newList.push(""); 
    setKeypointList(newList);
  };
  const handleKeypointChange = (index: number, value: string) => {
    const newList = [...keypointList];
    newList[index] = value;
    setKeypointList(newList);
  };

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
    
    const validKeypoints = keypointList.filter(k => k.trim() !== "");
    formData.set("keypoints", JSON.stringify(validKeypoints)); 

    const result = await saveCourseContent(formData);

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
      
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-800">Edit Informasi Kelas</h3>
        <p className="text-sm text-gray-500">Kelola detail, harga, dan rating visual kelas.</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Cover Kelas</label>
               <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 group hover:border-[#00C9A7] transition-colors">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={40} /></div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100 shadow-lg">
                        <Upload size={16} /> Ganti Gambar
                        <input type="file" name="thumbnail" accept="image/*" className="hidden" onChange={handleImageChange} />
                     </label>
                  </div>
               </div>
               <p className="text-xs text-gray-400 mt-2">Format: JPG/PNG. Ukuran rekomen: 1280x720px.</p>
           </div>

           <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
              <div>
                 <h4 className="text-sm font-bold text-gray-900">Status Kelas</h4>
                 <p className="text-xs text-gray-500">Tayangkan ke siswa atau simpan sebagai draft.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" name="is_published" defaultChecked={course.is_published} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C9A7]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C9A7]"></div>
              </label>
           </div>

           <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 space-y-4">
               <div>
                 <h4 className="text-sm font-bold text-orange-900">Social Proof (Visual Opsional)</h4>
                 <p className="text-xs text-orange-700">Tampilkan angka ini untuk menarik minat pembeli.</p>
               </div>
               
               <div className="grid grid-cols-3 gap-3">
                   <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Bintang</label>
                      <input name="rating" type="number" step="0.1" defaultValue={course.rating || 0} className="w-full px-3 py-1.5 border border-orange-200 rounded-md outline-none text-sm" />
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Jml Review</label>
                      <input name="review_count" type="number" defaultValue={course.review_count || 0} className="w-full px-3 py-1.5 border border-orange-200 rounded-md outline-none text-sm" />
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Terjual</label>
                      <input name="sales_count" type="number" defaultValue={course.sales_count || 0} className="w-full px-3 py-1.5 border border-orange-200 rounded-md outline-none text-sm" />
                   </div>
               </div>
           </div>
        </div>

        <div className="space-y-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kelas</label>
              <input name="title" defaultValue={course.title} required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none transition" />
           </div>

           {/* --- KOTAK HIRARKI KATEGORI --- */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Main Kategori</label>
                 <select 
                    name="main_category_id" 
                    value={selectedMainCat}
                    onChange={(e) => setSelectedMainCat(e.target.value)}
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-white cursor-pointer"
                 >
                    <option value="" disabled>-- Pilih Main Kategori --</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                 </select>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Sub Kategori</label>
                 <select 
                    name="sub_category_id" 
                    defaultValue={course.sub_category_id || ""}
                    disabled={!selectedMainCat} 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                 >
                    <option value="">-- Kosongkan --</option>
                    {filteredSubCats.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                 </select>
              </div>
           </div>

           {/* --- KOTAK LEVEL & HARGA --- */}
           <div className="grid grid-cols-3 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                 <select 
                    name="level_id" 
                    defaultValue={course.level_id || ""} 
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none transition bg-white cursor-pointer"
                  >
                    <option value="" disabled>-- Pilih Level --</option>
                    {levels.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                    ))}
                 </select>
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input name="price" type="number" defaultValue={course.price} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none transition" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hrg Coret (Rp)</label>
                  <input name="strike_price" type="number" defaultValue={course.strike_price || 0} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition" />
               </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
              <textarea name="description" rows={2} defaultValue={course.description || ""} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none transition" />
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Goals</label>
              <textarea name="goals" rows={3} placeholder="Tujuan pembelajaran..." defaultValue={course.goals || ""} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm transition" />
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keypoints</label>
              <div className="space-y-2">
                {keypointList.map((kp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={kp} onChange={(e) => handleKeypointChange(index, e.target.value)} placeholder={`Poin ${index + 1}...`} className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00C9A7] outline-none text-sm transition" />
                    <button type="button" onClick={() => removeKeypoint(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addKeypoint} className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#00C9A7] hover:text-[#00b894] transition"><Plus size={16} /> Tambah Poin Baru</button>
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
        <button type="submit" disabled={isLoading} className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition w-full md:w-auto shadow-lg shadow-gray-200">
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </div>

    </form>
  );
}