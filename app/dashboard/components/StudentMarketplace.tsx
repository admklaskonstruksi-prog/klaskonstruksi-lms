"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Layers, Star, ShoppingCart, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface StudentMarketplaceProps {
  courses: any[];
  mainCategories: any[];
  subCategories: any[];
  ownedCourseIds?: string[];
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

  const activeSubCats = subCategories.filter(sub => sub.main_category_id === selectedMainCat);

  // --- LOGIC FILTER ---
  const filteredCourses = courses.filter((course) => {
    const matchTitle = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMain = selectedMainCat === "All" || course.main_category_id === selectedMainCat;
    const matchSub = selectedSubCat === "All" || course.sub_category_id === selectedSubCat;
    return matchTitle && matchMain && matchSub;
  });

  const handleMainCatChange = (catId: string) => {
    setSelectedMainCat(catId);
    setSelectedSubCat("All"); 
  };

  const formatRupiah = (price: any) => {
    const numPrice = Number(price || 0);
    if (numPrice === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  // --- FUNGSI TAMBAH KE KERANJANG CEPAT ---
  const handleAddToCart = (e: React.MouseEvent, course: any) => {
    e.preventDefault(); // Mencegah pindah halaman saat icon diklik
    const existingCart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
    
    if (!existingCart.some((item: any) => item.id === course.id)) {
       existingCart.push({
          id: course.id,
          title: course.title,
          price: Number(course.price || 0),
          thumbnail: course.thumbnail_url,
          category: course.sub_categories?.name || "Umum"
       });
       localStorage.setItem("klas_cart", JSON.stringify(existingCart));
       window.dispatchEvent(new Event("cartUpdated")); // Memicu notifikasi angka di keranjang
       toast.success("Berhasil ditambahkan ke keranjang!");
    } else {
       toast.error("Kelas sudah ada di keranjang.");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* --- HEADER & PENCARIAN --- */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black text-gray-950 mb-4 tracking-tight">Jelajah Kelas</h2>
        <div className="flex flex-col gap-4">
          
          {/* Input Search */}
          <div className="relative w-full border border-gray-100 rounded-xl overflow-hidden bg-gray-50 flex items-center focus-within:ring-2 focus-within:ring-[#00C9A7] transition-all group shadow-inner">
            <Search className="absolute left-4 text-gray-400 group-focus-within:text-[#00C9A7]" size={20} />
            <input 
              type="text"
              placeholder="Cari kelas yang ingin Anda pelajari..."
              className="w-full pl-12 pr-4 py-3.5 bg-transparent outline-none text-sm font-semibold text-gray-700 placeholder:text-gray-400"
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

          {/* Filter SUB KATEGORI */}
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
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search size={24} />
           </div>
           <h3 className="font-bold text-gray-700 text-lg">Tidak ada kelas ditemukan</h3>
           <p className="text-gray-400 text-sm mt-1 max-w-xs">Coba sesuaikan filter kategori atau cari dengan kata kunci lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const isOwned = ownedCourseIds.includes(course.id);
            // Pilih link: kalau udah punya masuk ke learning path, kalau belum ke detail dashboard
            const targetHref = isOwned ? `/dashboard/learning-path/${course.id}` : `/dashboard/checkout/${course.id}`;

            return (
              <Link 
                href={targetHref}
                key={course.id} 
                className={`group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-[#00C9A7]/20 transition-all duration-300 hover:-translate-y-1 relative ${isOwned ? 'opacity-80 grayscale-[30%]' : ''}`}
              >
                {/* Thumbnail Image */}
                <div className="relative w-full aspect-video bg-gray-50 border-b border-gray-100 overflow-hidden shrink-0 shadow-inner">
                  {course.thumbnail_url ? (
                    <Image 
                      src={course.thumbnail_url} 
                      alt={course.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1 bg-gray-100">
                       <BookOpen size={30} className="opacity-40" />
                       <span className="text-[10px] font-bold">No Cover</span>
                    </div>
                  )}
                  
                  {isOwned && (
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-[1px]">
                       <span className="bg-white text-gray-900 font-black px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-1.5"><Tag size={14}/> DIMILIKI</span>
                     </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[11px] text-[#00C9A7] font-black uppercase mb-1.5 tracking-wider">{course.main_categories?.name || "UMUM"}</p>
                  <h3 className="font-black text-gray-950 line-clamp-2 text-base leading-snug group-hover:text-[#00C9A7] transition-colors mb-3.5 flex-1">
                     {course.title}
                  </h3>

                  {/* Info Tambahan */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-semibold mt-auto flex-wrap border-t border-gray-100 pt-4">
                     <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                        <Layers size={13} className="text-[#00C9A7]"/> {course.course_levels?.name || course.difficulty || "All Level"}
                     </span>
                     <span className="flex items-center gap-1.5 bg-yellow-50 text-[#b4690e] px-2.5 py-1.5 rounded-md border border-yellow-100 font-bold ml-auto">
                        {Number(course.rating || 5).toFixed(1)}
                        <Star size={13} className="fill-yellow-400 text-yellow-400"/>
                     </span>
                  </div>

                  {/* Harga & Tombol Keranjang */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{course.sub_categories?.name || "Kategori Umum"}</p>
                        <p className={`text-xl font-black tracking-tight ${isOwned ? 'text-gray-900' : 'text-[#00C9A7]'}`}>
                            {formatRupiah(course.price)}
                        </p>
                     </div>
                     
                     {/* TOMBOL ADD TO CART / RUANG BELAJAR */}
                     {isOwned ? (
                       <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors bg-[#00C9A7] text-white">
                          <BookOpen size={16} />
                       </div>
                     ) : (
                       <button 
                         onClick={(e) => handleAddToCart(e, course)}
                         title="Tambahkan ke Keranjang"
                         className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white border border-orange-100 group/cart z-10"
                       >
                          <ShoppingCart size={18} className="group-hover/cart:scale-110 transition-transform" />
                       </button>
                     )}
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