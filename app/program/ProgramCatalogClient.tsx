"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Search, BookOpen, Layers, Star, CheckSquare, Square, Tag, ChevronDown, ChevronUp } from "lucide-react";

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
  const [openAccordion, setOpenAccordion] = useState<string[]>(['category', 'level', 'price', 'rating']);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [selectedSubCat, setSelectedSubCat] = useState("All");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<"All" | "Free" | "Paid">("All");
  const [minRating, setMinRating] = useState<number>(0);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset Pagination jika filter berubah
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, selectedMainCat, selectedSubCat, selectedLevels, priceFilter, minRating]);

  const toggleAccordion = (id: string) => {
     setOpenAccordion(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const activeSubCats = subCategories.filter(sub => sub.main_category_id === selectedMainCat);

  // LOGIC FILTERING CANGGIH
  const filteredCourses = courses.filter((course) => {
    // 1. Text Search
    const matchTitle = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Main & Sub Category
    const matchMain = selectedMainCat === "All" || course.main_category_id === selectedMainCat;
    const matchSub = selectedSubCat === "All" || course.sub_category_id === selectedSubCat;
    
    // 3. Multiselect Levels
    const matchLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level_id);
    
// 4. Price Filter
let matchPrice = true;
const safePrice = Number(course.price || 0); // Pengaman
if (priceFilter === "Free") matchPrice = safePrice === 0;
if (priceFilter === "Paid") matchPrice = safePrice > 0;
    
    // 5. Rating Filter (Minimal Rating)
    const courseRating = course.rating || 5.0; // Default 5 jika belum ada
    const matchRating = courseRating >= minRating;

    return matchTitle && matchMain && matchSub && matchLevel && matchPrice && matchRating;
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

  const formatRupiah = (price: any) => {
    const numPrice = Number(price || 0); // Pengaman tipe data dari database
    if (numPrice === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(numPrice);
  };

  // KOMPONEN RENDER BINTANG REVIEW
  const renderStars = (rating: number, interactive: boolean = false, onClick?: () => void) => {
     return (
        <div className={`flex items-center gap-1 ${interactive ? 'cursor-pointer' : ''}`} onClick={onClick}>
           {[...Array(5)].map((_, i) => (
              <Star 
                 key={i} 
                 size={interactive ? 20 : 14} 
                 className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${interactive ? 'group-hover:scale-110 transition' : ''}`} 
                 strokeWidth={interactive ? 1.5 : 0}
              />
           ))}
        </div>
     )
  }

  // KOMPONEN RENDER HEADER ACCORDION
  const renderAccordionHeader = (id: string, title: string) => (
     <button onClick={() => toggleAccordion(id)} className="flex items-center justify-between w-full py-4.5 group border-t border-gray-100 mt-2 first:mt-0 first:border-t-0">
        <h3 className="font-extrabold text-gray-950 text-base md:text-lg tracking-tight">{title}</h3>
        {openAccordion.includes(id) ? <ChevronUp size={20} className="text-gray-400 group-hover:text-[#00C9A7]" /> : <ChevronDown size={20} className="text-gray-400 group-hover:text-[#00C9A7]" />}
     </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#00C9A7] selection:text-white flex flex-col">
      
      {/* --- NAVBAR (Sama dengan kode sebelumnya) --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain rounded-lg" priority />
              <span className="text-xl font-black text-gray-950 tracking-tighter">Klas<span className="text-[#00C9A7]">Konstruksi</span></span>
            </Link>

            <div className="hidden md:flex items-center space-x-7">
              <Link href="/" className="text-gray-700 hover:text-[#00C9A7] font-semibold transition text-sm">Beranda</Link>
              <Link href="/program" className="text-[#00C9A7] font-extrabold transition text-sm">Program Klas</Link>
              <Link href="/#mentor" className="text-gray-700 hover:text-[#00C9A7] font-semibold transition text-sm">Daftar Mentor</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-gray-700 font-bold hover:text-[#00C9A7] transition text-sm">Masuk</Link>
              <Link href="/register" className="px-6 py-2.5 bg-gray-950 hover:bg-gray-800 text-white font-bold rounded-full transition shadow-lg shadow-gray-900/10 flex items-center gap-2 text-sm">
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
      </nav>

      {/* --- KONTEN KATALOG DENGAN ASIDE BARU --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full flex flex-col lg:flex-row gap-10 items-start">
        
        {/* SIDEBAR FILTER (RENOVASI TOTAL) */}
        <aside className="w-full lg:w-[320px] shrink-0 sticky top-28 bg-white p-7 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
           
           {/* Pencarian (Pindah ke Atas Aside) */}
           <div className="relative w-full mb-6 border border-gray-100 rounded-xl overflow-hidden bg-gray-50 flex items-center focus-within:ring-2 focus-within:ring-[#00C9A7] transition-all group shadow-inner">
             <Search className="absolute left-4 text-gray-400 group-focus-within:text-[#00C9A7]" size={18} />
             <input type="text" placeholder="Cari materi teknik..." className="w-full pl-12 pr-4 py-3.5 bg-transparent outline-none text-sm font-semibold text-gray-700 placeholder:text-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>

           <div className="divide-y divide-gray-100">
              
              {/* 1. Filter Kategori */}
              <div>
                 {renderAccordionHeader('category', 'Kategori Program')}
                 {openAccordion.includes('category') && (
                    <div className="space-y-3 pb-6 pr-2 max-h-[300px] overflow-y-auto no-scrollbar pt-1">
                       <label className="flex items-center gap-3.5 cursor-pointer group">
                         <input type="radio" name="mainCat" checked={selectedMainCat === "All"} onChange={() => handleMainCatChange("All")} className="w-4.5 h-4.5 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                         <span className={`text-sm transition ${selectedMainCat === "All" ? "text-gray-950 font-bold" : "text-gray-600 font-semibold group-hover:text-[#00C9A7]"}`}>Semua Program</span>
                       </label>

                       {mainCategories.map((cat) => (
                          <div key={cat.id} className="space-y-3">
                             <label className="flex items-center gap-3.5 cursor-pointer group">
                               <input type="radio" name="mainCat" checked={selectedMainCat === cat.id} onChange={() => handleMainCatChange(cat.id)} className="w-4.5 h-4.5 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                               <span className={`text-sm transition ${selectedMainCat === cat.id ? "text-gray-950 font-bold" : "text-gray-600 font-semibold group-hover:text-[#00C9A7]"}`}>{cat.name}</span>
                             </label>
                             
                             {/* Dropdown Sub Kategori (NESTED STYLE) */}
                             {selectedMainCat === cat.id && activeSubCats.length > 0 && (
                                <div className="ml-7 pl-4 border-l-2 border-gray-100 space-y-2.5 mt-2 py-1">
                                   <label className="flex items-center gap-3 cursor-pointer group">
                                      <input type="radio" name="subCat" checked={selectedSubCat === "All"} onChange={() => setSelectedSubCat("All")} className="w-4 h-4 text-[#F97316] border-gray-300 focus:ring-[#F97316] transition" />
                                      <span className={`text-[13px] transition ${selectedSubCat === "All" ? "text-[#F97316] font-bold" : "text-gray-500 font-medium group-hover:text-[#F97316]"}`}>Semua Spesialisasi</span>
                                   </label>
                                   {activeSubCats.map(sub => (
                                      <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                                         <input type="radio" name="subCat" checked={selectedSubCat === sub.id} onChange={() => setSelectedSubCat(sub.id)} className="w-4 h-4 text-[#F97316] border-gray-300 focus:ring-[#F97316] transition" />
                                         <span className={`text-[13px] transition ${selectedSubCat === sub.id ? "text-[#F97316] font-bold" : "text-gray-500 font-medium group-hover:text-[#F97316]"}`}>{sub.name}</span>
                                      </label>
                                   ))}
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* 2. Filter Tingkat Kesulitan */}
              <div>
                 {renderAccordionHeader('level', 'Tingkat Kesulitan')}
                 {openAccordion.includes('level') && (
                    <div className="space-y-3 pb-6 pt-1">
                       {levels.map((lvl) => {
                          const isChecked = selectedLevels.includes(lvl.id);
                          return (
                            <button key={lvl.id} onClick={() => handleLevelToggle(lvl.id)} className="flex items-center gap-3.5 w-full text-left group">
                              {isChecked ? <CheckSquare size={19} className="text-[#00C9A7]" /> : <Square size={19} className="text-gray-300 group-hover:text-[#00C9A7] transition" />}
                              <span className={`text-sm transition ${isChecked ? "text-gray-950 font-bold" : "text-gray-600 font-semibold group-hover:text-[#00C9A7]"}`}>{lvl.name}</span>
                            </button>
                          )
                       })}
                    </div>
                 )}
              </div>

              {/* 3. Filter Harga (BARU) */}
              <div>
                 {renderAccordionHeader('price', 'Tipe Pembayaran')}
                 {openAccordion.includes('price') && (
                    <div className="space-y-3 pb-6 pt-1">
                        {[
                          { id: "All", name: "Semua Harga" },
                          { id: "Paid", name: "Berbayar (Premium)" },
                          { id: "Free", name: "Gratis (Preview)" },
                        ].map((p:any) => {
                           const isChecked = priceFilter === p.id;
                           return (
                              <label key={p.id} className="flex items-center gap-3.5 cursor-pointer group">
                                 <input type="radio" name="priceCat" checked={isChecked} onChange={() => setPriceFilter(p.id)} className="w-4.5 h-4.5 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                                 <span className={`text-sm transition ${isChecked ? "text-gray-950 font-bold" : "text-gray-600 font-semibold group-hover:text-[#00C9A7]"}`}>{p.name}</span>
                              </label>
                           );
                        })}
                    </div>
                 )}
              </div>

              {/* 4. Filter Review (BARU) */}
              <div>
                 {renderAccordionHeader('rating', 'Rating Review Minimal')}
                 {openAccordion.includes('rating') && (
                    <div className="space-y-4 pb-6 pt-1">
                        {[5, 4, 3].map((r) => {
                           const isActive = minRating === r;
                           return (
                              <div key={r} onClick={() => setMinRating(isActive ? 0 : r)} className={`flex items-center gap-3 cursor-pointer group p-2 rounded-xl transition ${isActive ? 'bg-teal-50 border border-teal-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                                 {isActive ? <CheckSquare size={18} className="text-[#00C9A7]" /> : <Square size={18} className="text-gray-300 group-hover:text-[#00C9A7]" />}
                                 {renderStars(r)}
                                 <span className={`text-xs font-bold transition ${isActive ? 'text-[#00C9A7]' : 'text-gray-600'}`}>{r}.0 Keatas</span>
                              </div>
                           );
                        })}
                    </div>
                 )}
              </div>

           </div>

           {/* Tombol Reset Filter */}
           {(selectedMainCat !== "All" || selectedLevels.length > 0 || priceFilter !== "All" || minRating !== 0 || searchTerm !== "") && (
              <button onClick={() => {
                 setSearchTerm(""); setSelectedMainCat("All"); setSelectedSubCat("All");
                 setSelectedLevels([]); setPriceFilter("All"); setMinRating(0);
              }} className="w-full mt-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition">
                 Hapus Semua Filter
              </button>
           )}

        </aside>

        {/* --- AREA GRID KELAS KANAN (TETAP SAMA DENGAN REVISI SEBELUMNYA) --- */}
        <section className="flex-1 w-full flex flex-col gap-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">Katalog Program Klas</h1>
              <span className="text-sm font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                 Ditemukan <span className="font-extrabold text-[#00C9A7] text-base">{filteredCourses.length}</span> Materi Siap Proyek
              </span>
           </div>

           {filteredCourses.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-100 flex flex-col items-center">
                <Image src="/logo.png" alt="logo" width={60} height={60} className="grayscale opacity-20 mb-6"/>
                <h3 className="font-black text-gray-700 text-xl tracking-tight">Kelas Tidak Ditemukan</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">Coba sesuaikan kata kunci pencarian atau ubah kombinasi filter di panel sebelah kiri.</p>
             </div>
           ) : (
             <>
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {displayedCourses.map((course) => {
                   const isOwned = ownedCourseIds.includes(course.id);
                   const targetHref = isOwned ? `/dashboard/learning-path/${course.id}` : `/program/${course.id}`; // Perbaikan rute detail publik

                   return (
                     <Link href={targetHref} key={course.id} className={`group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-[#00C9A7]/20 transition-all duration-300 hover:-translate-y-1 ${isOwned ? 'opacity-80 grayscale-[30%]' : ''}`} >
                       <div className="relative w-full aspect-video bg-gray-50 border-b border-gray-100 overflow-hidden shrink-0 shadow-inner">
                         {course.thumbnail_url ? (
                           <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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

                       <div className="p-5 flex flex-col flex-1">
                         <p className="text-[11px] text-[#00C9A7] font-black uppercase mb-1.5 tracking-wider">{course.main_categories?.name || "UMUM"}</p>
                         <h3 className="font-black text-gray-950 line-clamp-2 text-base leading-snug group-hover:text-[#00C9A7] transition-colors mb-3.5 flex-1">
                            {course.title}
                         </h3>

                         <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-semibold mt-auto flex-wrap border-t border-gray-100 pt-4">
                            <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                               <Layers size={13} className="text-[#00C9A7]"/> {course.course_levels?.name || "All Level"}
                            </span>
                            <span className="flex items-center gap-1.5 bg-yellow-50 text-[#b4690e] px-2.5 py-1.5 rounded-md border border-yellow-100 font-bold ml-auto">
                               {course.rating?.toFixed(1) || "5.0"}
                               <Star size={13} className="fill-yellow-400 text-yellow-400"/>
                            </span>
                         </div>

                         <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{course.sub_categories?.name || "Kategori Umum"}</p>
                               <p className={`text-xl font-black ${isOwned ? 'text-gray-950' : 'text-[#00C9A7]'} tracking-tight`}>
                                   {formatRupiah(course.price)}
                               </p>
                            </div>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isOwned ? 'bg-[#00C9A7] text-white' : 'bg-gray-100 group-hover:bg-[#00C9A7] group-hover:text-white'}`}>
                               <BookOpen size={16} />
                            </div>
                         </div>
                       </div>
                     </Link>
                   );
                 })}
               </div>

               {/* TOMBOL LIHAT LEBIH BANYAK */}
               {visibleCount < filteredCourses.length && (
                 <div className="mt-12 flex justify-center pb-10">
                    <button onClick={() => setVisibleCount(v => v + 12)} className="px-10 py-4 bg-white border-2 border-gray-100 text-gray-800 font-extrabold rounded-xl hover:border-[#00C9A7]/50 hover:text-[#00C9A7] transition shadow-xl shadow-gray-100 flex items-center gap-2.5 text-base" >
                       Lihat Lebih Banyak Program <ArrowRight size={18} />
                    </button>
                 </div>
               )}
             </>
           )}
        </section>
      </main>

      {/* --- FOOTER (TETAP SAMA DENGAN KODE SEBELUMNYA) --- */}
      <footer className="bg-gray-950 text-white pt-20 pb-10 border-t-4 border-[#00C9A7] mt-auto relative overflow-hidden">
         <div className="absolute inset-0 opacity-5 grayscale pointer-events-none scale-125">
             <Image src="/logo.png" alt="pattern" fill className="object-contain" />
         </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="Logo" width={60} height={60} className="rounded-xl object-contain bg-white p-1" />
              <span className="text-2xl font-black tracking-tighter text-white">Klas<span className="text-[#00C9A7]">Konstruksi</span></span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Platform e-learning teknik sipil dan konstruksi terlengkap. Mencetak engineer handal yang siap menghadapi tantangan proyek nyata dengan materi siap kerja.
            </p>
          </div>
          <div>
            <h4 className="font-extrabold text-lg mb-6 text-white tracking-tight">Menu Navigasi</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><Link href="/" className="hover:text-[#00C9A7] transition">Beranda Utama</Link></li>
              <li><Link href="/program" className="hover:text-[#00C9A7] transition">Program Kelas</Link></li>
              <li><Link href="/#mentor" className="hover:text-[#00C9A7] transition">Daftar Mentor Ahli</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-lg mb-6 text-white tracking-tight">Bantuan & Informasi</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><Link href="/about" className="hover:text-[#00C9A7] transition">Tentang KlasKonstruksi</Link></li>
              <li><Link href="/contact" className="hover:text-[#00C9A7] transition">Hubungi Tim Kami</Link></li>
              <li><Link href="/terms" className="hover:text-[#00C9A7] transition">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4 relative z-10">
          <p>© {new Date().getFullYear()} Klas Konstruksi Indonesia. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
             <Link href="#" className="hover:text-white transition">Instagram</Link>
             <Link href="#" className="hover:text-white transition">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}