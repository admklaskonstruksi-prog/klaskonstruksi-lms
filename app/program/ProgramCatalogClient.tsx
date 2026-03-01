"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Search, BookOpen, Layers, Star, CheckSquare, Square } from "lucide-react";

interface Props {
  courses: any[];
  mainCategories: any[];
  subCategories: any[];
  levels: any[];
  ownedCourseIds: string[];
}

export default function ProgramCatalogClient({ courses, mainCategories, subCategories, levels, ownedCourseIds }: Props) {
  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [selectedSubCat, setSelectedSubCat] = useState("All");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset Pagination jika filter berubah
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, selectedMainCat, selectedSubCat, selectedLevels]);

  const activeSubCats = subCategories.filter(sub => sub.main_category_id === selectedMainCat);

  // LOGIC FILTERING
  const filteredCourses = courses.filter((course) => {
    const matchTitle = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMain = selectedMainCat === "All" || course.main_category_id === selectedMainCat;
    const matchSub = selectedSubCat === "All" || course.sub_category_id === selectedSubCat;
    const matchLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level_id);

    return matchTitle && matchMain && matchSub && matchLevel;
  });

  const displayedCourses = filteredCourses.slice(0, visibleCount);

  // HANDLERS
  const handleMainCatChange = (catId: string) => {
    setSelectedMainCat(catId);
    setSelectedSubCat("All");
  };

  const handleLevelToggle = (levelId: string) => {
    setSelectedLevels(prev => 
      prev.includes(levelId) ? prev.filter(id => id !== levelId) : [...prev, levelId]
    );
  };

  const formatRupiah = (price: number) => {
    if (!price || price === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#00C9A7] selection:text-white flex flex-col">
      
      {/* --- NAVBAR (Sama dengan Beranda) --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image src="/logo.png" alt="Logo" width={160} height={160} className="object-contain" priority />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Beranda</Link>
              <Link href="/program" className="text-[#00C9A7] font-bold transition-colors">Program Klas</Link>
              <Link href="/#mentor" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Daftar Mentor</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors">Masuk</Link>
              <Link href="/register" className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/30 flex items-center gap-2 hover:-translate-y-0.5">
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-[#00C9A7] focus:outline-none">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Beranda</Link>
              <Link href="/program" className="block w-full text-left px-3 py-3 text-base font-bold text-[#00C9A7] bg-teal-50 rounded-lg">Program Klas</Link>
              <Link href="/#mentor" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Daftar Mentor</Link>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/register" className="w-full text-center py-3 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- KONTEN KATALOG --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTER KIRI */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-28">
              
              {/* Filter Kategori */}
              <h3 className="font-black text-gray-900 mb-4 text-lg">Kategori Kelas</h3>
              <div className="space-y-3 mb-8">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="radio" name="mainCat" checked={selectedMainCat === "All"} onChange={() => handleMainCatChange("All")} className="w-4 h-4 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                   <span className={`text-sm font-medium transition-colors ${selectedMainCat === "All" ? "text-[#00C9A7] font-bold" : "text-gray-600 group-hover:text-[#00C9A7]"}`}>Semua Kategori</span>
                 </label>

                 {mainCategories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                       <label className="flex items-center gap-3 cursor-pointer group">
                         <input type="radio" name="mainCat" checked={selectedMainCat === cat.id} onChange={() => handleMainCatChange(cat.id)} className="w-4 h-4 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                         <span className={`text-sm font-medium transition-colors ${selectedMainCat === cat.id ? "text-[#00C9A7] font-bold" : "text-gray-600 group-hover:text-[#00C9A7]"}`}>{cat.name}</span>
                       </label>
                       
                       {/* Dropdown Sub Kategori (Muncul jika Main terpilih) */}
                       {selectedMainCat === cat.id && activeSubCats.length > 0 && (
                          <div className="ml-7 pl-3 border-l-2 border-gray-100 space-y-2 mt-2">
                             <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="radio" name="subCat" checked={selectedSubCat === "All"} onChange={() => setSelectedSubCat("All")} className="w-3.5 h-3.5 text-[#F97316] border-gray-300 focus:ring-[#F97316]" />
                                <span className={`text-xs transition-colors ${selectedSubCat === "All" ? "text-[#F97316] font-bold" : "text-gray-500 group-hover:text-[#F97316]"}`}>Semua Spesialisasi</span>
                             </label>
                             {activeSubCats.map(sub => (
                                <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                                   <input type="radio" name="subCat" checked={selectedSubCat === sub.id} onChange={() => setSelectedSubCat(sub.id)} className="w-3.5 h-3.5 text-[#F97316] border-gray-300 focus:ring-[#F97316]" />
                                   <span className={`text-xs transition-colors ${selectedSubCat === sub.id ? "text-[#F97316] font-bold" : "text-gray-500 group-hover:text-[#F97316]"}`}>{sub.name}</span>
                                </label>
                             ))}
                          </div>
                       )}
                    </div>
                 ))}
              </div>

              <div className="h-px w-full bg-gray-100 mb-6"></div>

              {/* Filter Tingkat Kesulitan / Level */}
              <h3 className="font-black text-gray-900 mb-4 text-lg">Tingkat Kesulitan</h3>
              <div className="space-y-3">
                 {levels.map((lvl) => {
                    const isChecked = selectedLevels.includes(lvl.id);
                    return (
                      <button 
                        key={lvl.id} 
                        onClick={() => handleLevelToggle(lvl.id)}
                        className="flex items-center gap-3 w-full text-left group"
                      >
                        {isChecked ? (
                           <CheckSquare size={18} className="text-[#00C9A7]" />
                        ) : (
                           <Square size={18} className="text-gray-300 group-hover:text-[#00C9A7] transition-colors" />
                        )}
                        <span className={`text-sm font-medium transition-colors ${isChecked ? "text-[#00C9A7] font-bold" : "text-gray-600 group-hover:text-[#00C9A7]"}`}>
                          {lvl.name}
                        </span>
                      </button>
                    )
                 })}
              </div>

           </div>
        </aside>

        {/* AREA GRID KELAS KANAN */}
        <section className="flex-1 w-full">
           
           {/* Pencarian */}
           <div className="relative w-full mb-8 bg-white rounded-2xl shadow-sm border border-gray-200">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input 
               type="text"
               placeholder="Cari berdasarkan judul materi atau keahlian..."
               className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent focus:outline-none focus:ring-2 focus:ring-[#00C9A7] transition text-sm font-medium text-gray-700"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

           {/* Hasil Grid */}
           <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Menampilkan <span className="text-[#00C9A7]">{filteredCourses.length}</span> Kelas
              </h2>
           </div>

           {filteredCourses.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                   <Search size={24} />
                </div>
                <h3 className="font-bold text-gray-600 text-lg">Kelas tidak ditemukan</h3>
                <p className="text-gray-400 text-sm mt-1">Coba sesuaikan filter kategori atau level kesulitan di sebelah kiri.</p>
             </div>
           ) : (
             <>
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {displayedCourses.map((course) => {
                   const isOwned = ownedCourseIds.includes(course.id);
                   const targetHref = isOwned ? `/dashboard/learning-path/${course.id}` : `/program/${course.id}`;

                   return (
                     <Link 
                       href={targetHref}
                       key={course.id} 
                       className={`group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isOwned ? 'opacity-80 grayscale-[40%] hover:grayscale-0' : ''}`}
                     >
                       <div className="relative w-full aspect-video bg-gray-100 border-b border-gray-100 overflow-hidden shrink-0">
                         {course.thumbnail_url ? (
                           <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                              <BookOpen size={40} className="mb-2 opacity-50" />
                           </div>
                         )}
                         {isOwned && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-[1px]">
                              <span className="bg-white text-[#00C9A7] font-black px-4 py-2 rounded-lg shadow-lg text-sm">SUDAH DIMILIKI</span>
                            </div>
                         )}
                       </div>

                       <div className="p-5 flex flex-col flex-1">
                         <h3 className="font-bold text-gray-800 line-clamp-2 text-[15px] group-hover:text-[#00C9A7] transition-colors mb-3">
                            {course.title}
                         </h3>

                         <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 font-medium mt-auto">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                               <Layers size={12} className="text-[#00C9A7]"/> {course.course_levels?.name || course.difficulty || "Semua Level"}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                               <Star size={12} className="text-yellow-400 fill-yellow-400"/> {course.rating || "5.0"}
                            </span>
                         </div>

                         <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{course.sub_categories?.name || "Kategori Umum"}</p>
                               <p className={`text-lg font-black ${isOwned ? 'text-gray-900' : 'text-[#F97316]'}`}>
                                   {formatRupiah(course.price)}
                               </p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOwned ? 'bg-[#00C9A7] text-white' : 'bg-gray-100 group-hover:bg-[#F97316] group-hover:text-white'}`}>
                               <BookOpen size={14} />
                            </div>
                         </div>
                       </div>
                     </Link>
                   );
                 })}
               </div>

               {/* TOMBOL LIHAT LEBIH BANYAK */}
               {visibleCount < filteredCourses.length && (
                 <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setVisibleCount(v => v + 12)}
                      className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors shadow-sm flex items-center gap-2"
                    >
                       Lihat Lebih Banyak <ArrowRight size={18} />
                    </button>
                 </div>
               )}
             </>
           )}
        </section>

      </main>

      {/* --- FOOTER (Sama dengan Beranda) --- */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-4 border-[#00C9A7] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded object-contain opacity-90 grayscale hover:grayscale-0 transition-all bg-white" />
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mt-4">
              Platform e-learning teknik sipil dan konstruksi terlengkap. Mencetak engineer handal yang siap menghadapi tantangan proyek nyata.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Menu Navigasi</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#00C9A7] transition-colors">Beranda</Link></li>
              <li><Link href="/program" className="hover:text-[#00C9A7] transition-colors">Program Klas</Link></li>
              <li><Link href="/#mentor" className="hover:text-[#00C9A7] transition-colors">Daftar Mentor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Informasi Lain</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#00C9A7] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-[#00C9A7] transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

    </div>
  );
}