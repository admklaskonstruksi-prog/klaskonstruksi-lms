"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Layers, Star } from "lucide-react";

interface StudentMarketplaceProps {
  courses: any[];
  mainCategories: any[];
  subCategories: any[];
  ownedCourseIds?: string[]; // Opsional: Untuk menandai kelas yang sudah dibeli
}

export default function StudentMarketplace({ 
  courses, 
  mainCategories, 
  subCategories,
  ownedCourseIds = []
}: StudentMarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [selectedSubCat, setSelectedSubCat] = useState("All");

  // Ambil Sub-Kategori yang sesuai dengan Main Kategori yang dipilih
  const activeSubCats = subCategories.filter(sub => sub.main_category_id === selectedMainCat);

  // --- LOGIC FILTER ---
  const filteredCourses = courses.filter((course) => {
    // 1. Filter by Search Text
    const matchTitle = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filter by Main Category
    const matchMain = selectedMainCat === "All" || course.main_category_id === selectedMainCat;

    // 3. Filter by Sub Category
    const matchSub = selectedSubCat === "All" || course.sub_category_id === selectedSubCat;

    return matchTitle && matchMain && matchSub;
  });

  // Handle perubahan Main Category (Otomatis mereset Sub Category)
  const handleMainCatChange = (catId: string) => {
    setSelectedMainCat(catId);
    setSelectedSubCat("All"); // Reset sub ke "Semua" setiap pindah Main Kategori
  };

  // --- FORMATTER RUPIAH ---
  const formatRupiah = (price: number) => {
    if (!price || price === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-8">
      
      {/* --- HEADER & PENCARIAN --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Jelajah Kelas</h2>
        <div className="flex flex-col gap-4">
          
          {/* Input Search */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Cari kelas yang ingin Anda pelajari..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7] transition text-sm font-medium text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter KATEGORI UTAMA */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mt-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 shrink-0">Kategori:</span>
            <button 
              onClick={() => handleMainCatChange("All")}
              className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                selectedMainCat === "All" ? "bg-[#00C9A7] text-white shadow-md shadow-[#00C9A7]/20" : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#00C9A7] hover:text-[#00C9A7]"
              }`}
            >
              Semua
            </button>
            {mainCategories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => handleMainCatChange(cat.id)}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                  selectedMainCat === cat.id ? "bg-[#00C9A7] text-white shadow-md shadow-[#00C9A7]/20" : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#00C9A7] hover:text-[#00C9A7]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Filter SUB KATEGORI (Muncuk jika Main Kategori dipilih) */}
          {selectedMainCat !== "All" && activeSubCats.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 shrink-0">Sub Kategori:</span>
              <button 
                onClick={() => setSelectedSubCat("All")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedSubCat === "All" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              {activeSubCats.map((sub) => (
                <button 
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedSubCat === sub.id ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* --- GRID KELAS --- */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
              <Search size={24} />
           </div>
           <h3 className="font-bold text-gray-600">Tidak ada kelas ditemukan</h3>
           <p className="text-gray-400 text-sm">Coba sesuaikan filter atau cari dengan kata kunci lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const isOwned = ownedCourseIds.includes(course.id);
            // Pilih link: kalau udah punya masuk ke learning path, kalau belum ke checkout
            const targetHref = isOwned ? `/dashboard/learning-path/${course.id}` : `/dashboard/checkout/${course.id}`;

            return (
              <Link 
                href={targetHref}
                key={course.id} 
                className={`group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isOwned ? 'opacity-80 grayscale-[40%] hover:grayscale-0' : ''}`}
              >
                {/* Thumbnail Image */}
                <div className="relative w-full aspect-video bg-gray-100 border-b border-gray-100 overflow-hidden shrink-0">
                  {course.thumbnail_url ? (
                    <Image 
                      src={course.thumbnail_url} 
                      alt={course.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                       <BookOpen size={40} className="mb-2 opacity-50" />
                       <span className="text-xs font-bold">No Image</span>
                    </div>
                  )}
                  
                  {isOwned && (
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-[1px]">
                       <span className="bg-white text-[#00C9A7] font-black px-4 py-2 rounded-lg shadow-lg text-sm">SUDAH DIMILIKI</span>
                     </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 line-clamp-2 text-lg group-hover:text-[#00C9A7] transition-colors mb-3">
                     {course.title}
                  </h3>

                  {/* Info Tambahan */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 font-medium mt-auto">
                     <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Layers size={12} /> {course.course_levels?.name || course.difficulty || "Semua Level"}
                     </span>
                     <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Star size={12} className="text-yellow-400 fill-yellow-400"/> {course.rating || "5.0"}
                     </span>
                  </div>

                  {/* Harga & Tombol */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{course.sub_categories?.name || "Kategori Umum"}</p>
                        <p className={`text-lg font-black ${isOwned ? 'text-gray-900' : 'text-[#00C9A7]'}`}>
                            {formatRupiah(course.price)}
                        </p>
                     </div>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOwned ? 'bg-[#00C9A7] text-white' : 'bg-gray-100 group-hover:bg-[#00C9A7] group-hover:text-white'}`}>
                        <BookOpen size={14} />
                     </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}