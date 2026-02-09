"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Layers, Star, Clock } from "lucide-react";

interface StudentMarketplaceProps {
  courses: any[];
  categories: any[];
}

export default function StudentMarketplace({ courses, categories }: StudentMarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- LOGIC FILTER ---
  const filteredCourses = courses.filter((course) => {
    // 1. Filter by Search Text
    const matchTitle = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filter by Category
    const matchCategory = selectedCategory === "All" || course.categories?.name === selectedCategory;

    return matchTitle && matchCategory;
  });

  // --- FORMATTER RUPIAH ---
  const formatRupiah = (price: number) => {
    if (price === 0) return "GRATIS";
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
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Input Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Cari kelas yang ingin Anda pelajari..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C9A7] transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Kategori (Dropdown di Mobile / Chips di Desktop) */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button 
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === "All" 
                ? "bg-[#00C9A7] text-white shadow-lg shadow-green-100" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.name 
                  ? "bg-[#00C9A7] text-white shadow-lg shadow-green-100" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- GRID KELAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <Link 
            href={`/dashboard/learning-path/${course.id}`} // Link menuju halaman belajar siswa
            key={course.id} 
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
          >
            {/* Thumbnail Image */}
            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
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
              
              {/* Badge Kategori */}
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 shadow-sm border border-gray-100">
                  {course.categories?.name || "Umum"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-gray-800 line-clamp-2 text-lg group-hover:text-[#00C9A7] transition-colors">
                    {course.title}
                 </h3>
              </div>

              {/* Info Tambahan */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 font-medium">
                 <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                    <Layers size={12} /> {course.difficulty || "Beginner"}
                 </span>
                 <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                    <Star size={12} className="text-yellow-400 fill-yellow-400"/> 5.0
                 </span>
              </div>

              {/* Harga & Tombol */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                 <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Harga Kelas</p>
                    <p className="text-lg font-black text-[#00C9A7]">
                        {formatRupiah(course.price)}
                    </p>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#00C9A7] group-hover:text-white transition-colors">
                    <BookOpen size={14} />
                 </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* --- EMPTY STATE (Jika tidak ada hasil) --- */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
              <Search size={24} />
           </div>
           <h3 className="font-bold text-gray-600">Tidak ada kelas ditemukan</h3>
           <p className="text-gray-400 text-sm">Coba cari dengan kata kunci lain.</p>
        </div>
      )}
    </div>
  );
}