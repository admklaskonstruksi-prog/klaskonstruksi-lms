"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Layers, Star, ShoppingCart, Tag, ChevronDown, ChevronUp, CheckSquare, Square, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface StudentMarketplaceProps {
  courses: any[];
  mainCategories: any[];
  subCategories: any[];
  levels: any[];
  ownedCourseIds?: string[];
}

export default function StudentMarketplace({ 
  courses, 
  mainCategories, 
  subCategories, 
  levels,
  ownedCourseIds = [] 
}: StudentMarketplaceProps) {
  
  const [openAccordion, setOpenAccordion] = useState<string[]>(['category', 'level']);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [selectedSubCat, setSelectedSubCat] = useState("All");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState(12);

  // --- LOGIKA HARGA (Mendeteksi otomatis harga termahal dari database) ---
  const maxCoursePrice = Math.max(0, ...courses.map(c => Number(c.price || 0)));
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const currentMaxPrice = maxPriceFilter !== null ? maxPriceFilter : maxCoursePrice;

  useEffect(() => { setVisibleCount(12); }, [searchTerm, selectedMainCat, selectedSubCat, selectedLevels, maxPriceFilter, minRating]);

  const toggleAccordion = (id: string) => { setOpenAccordion(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]); };
  const activeSubCats = subCategories.filter(sub => sub.main_category_id === selectedMainCat);

  // FILTERING
  const filteredCourses = courses.filter((course) => {
    const matchTitle = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMain = selectedMainCat === "All" || course.main_category_id === selectedMainCat;
    const matchSub = selectedSubCat === "All" || course.sub_category_id === selectedSubCat;
    const matchLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level_id);
    const safePrice = Number(course.price || 0);
    const matchPrice = safePrice <= currentMaxPrice; // Cek range harga
    const matchRating = Number(course.rating || 5) >= minRating;
    
    return matchTitle && matchMain && matchSub && matchLevel && matchPrice && matchRating;
  });

  const displayedCourses = filteredCourses.slice(0, visibleCount);

  const handleMainCatChange = (catId: string) => { setSelectedMainCat(catId); setSelectedSubCat("All"); };
  const handleLevelToggle = (levelId: string) => { setSelectedLevels(prev => prev.includes(levelId) ? prev.filter(id => id !== levelId) : [...prev, levelId]); };
  
  const formatRupiah = (price: any) => {
    const numPrice = Number(price || 0);
    if (numPrice === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(numPrice);
  };

  const formatSliderPrice = (price: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(price || 0));
  };

  const handleAddToCart = (e: React.MouseEvent, course: any) => {
    e.preventDefault(); 
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
       window.dispatchEvent(new Event("cartUpdated")); 
       toast.success("Berhasil ditambahkan ke keranjang!");
    } else {
       toast.error("Kelas sudah ada di keranjang.");
    }
  };

  const renderStars = (rating: number) => (
      <div className="flex items-center gap-1">
         {[...Array(5)].map((_, i) => (<Star key={i} size={14} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} strokeWidth={0}/>))}
      </div>
  )

  const renderAccordionHeader = (id: string, title: string) => (
     <button onClick={() => toggleAccordion(id)} className="flex items-center justify-between w-full py-4 group border-t border-gray-100 mt-2 first:mt-0 first:border-t-0">
        <h3 className="font-bold text-gray-900 text-[15px] tracking-tight">{title}</h3>
        {openAccordion.includes(id) ? <ChevronUp size={18} className="text-gray-400 group-hover:text-[#00C9A7]" /> : <ChevronDown size={18} className="text-gray-400 group-hover:text-[#00C9A7]" />}
     </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative w-full">
      
      {/* SIDEBAR FILTER */}
      <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-28 space-y-6">
         <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            
            <div className="relative w-full mb-5 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center focus-within:ring-2 focus-within:ring-[#00C9A7] transition-all group">
              <Search className="absolute left-3.5 text-gray-400 group-focus-within:text-[#00C9A7]" size={16} />
              <input type="text" placeholder="Cari materi..." className="w-full pl-10 pr-3 py-3 bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="divide-y divide-gray-100">
               {/* Kategori */}
               <div>
                  {renderAccordionHeader('category', 'Kategori Program')}
                  {openAccordion.includes('category') && (
                     <div className="space-y-2.5 pb-5 pr-1 max-h-[250px] overflow-y-auto no-scrollbar">
                        <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" name="mainCat" checked={selectedMainCat === "All"} onChange={() => handleMainCatChange("All")} className="w-4 h-4 text-[#00C9A7] border-gray-300 accent-[#00C9A7]" /><span className={`text-sm transition ${selectedMainCat === "All" ? "text-gray-900 font-bold" : "text-gray-600 font-medium"}`}>Semua Kategori</span></label>
                        {mainCategories.map((cat) => (
                           <div key={cat.id} className="space-y-2">
                              <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" name="mainCat" checked={selectedMainCat === cat.id} onChange={() => handleMainCatChange(cat.id)} className="w-4 h-4 text-[#00C9A7] border-gray-300 accent-[#00C9A7]" /><span className={`text-sm transition ${selectedMainCat === cat.id ? "text-gray-900 font-bold" : "text-gray-600 font-medium"}`}>{cat.name}</span></label>
                              {selectedMainCat === cat.id && activeSubCats.length > 0 && (
                                 <div className="ml-6 pl-3 border-l-2 border-gray-100 space-y-2 mt-1.5 py-0.5">
                                    <label className="flex items-center gap-2.5 cursor-pointer group"><input type="radio" name="subCat" checked={selectedSubCat === "All"} onChange={() => setSelectedSubCat("All")} className="w-3.5 h-3.5 text-[#F97316] border-gray-300 accent-[#F97316]" /><span className={`text-[12px] ${selectedSubCat === "All" ? "text-[#F97316] font-bold" : "text-gray-500"}`}>Semua Spesialisasi</span></label>
                                    {activeSubCats.map(sub => (<label key={sub.id} className="flex items-center gap-2.5 cursor-pointer group"><input type="radio" name="subCat" checked={selectedSubCat === sub.id} onChange={() => setSelectedSubCat(sub.id)} className="w-3.5 h-3.5 text-[#F97316] border-gray-300 accent-[#F97316]" /><span className={`text-[12px] ${selectedSubCat === sub.id ? "text-[#F97316] font-bold" : "text-gray-500"}`}>{sub.name}</span></label>))}
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Tingkat Kesulitan */}
               <div>
                  {renderAccordionHeader('level', 'Tingkat Kesulitan')}
                  {openAccordion.includes('level') && (
                     <div className="space-y-2.5 pb-5">
                        {levels.map((lvl) => {
                           const isChecked = selectedLevels.includes(lvl.id);
                           return (<button key={lvl.id} onClick={() => handleLevelToggle(lvl.id)} className="flex items-center gap-3 w-full text-left group">{isChecked ? <CheckSquare size={18} className="text-[#00C9A7]" /> : <Square size={18} className="text-gray-300 group-hover:text-[#00C9A7] transition" />}<span className={`text-sm ${isChecked ? "text-gray-900 font-bold" : "text-gray-600 font-medium"}`}>{lvl.name}</span></button>)
                        })}
                     </div>
                  )}
               </div>

               {/* Slider Harga Dashboard */}
               <div>
                  {renderAccordionHeader('price', 'Rentang Harga')}
                  {openAccordion.includes('price') && (
                     <div className="space-y-4 pb-5 pt-2">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-2">
                           <span>Rp 0</span>
                           <span className="text-[#00C9A7] bg-teal-50 px-2 py-1 rounded-md">{formatSliderPrice(currentMaxPrice)}</span>
                        </div>
                        <input 
                           type="range" 
                           min="0" 
                           max={maxCoursePrice > 0 ? maxCoursePrice : 100} 
                           step="10000"
                           value={currentMaxPrice} 
                           onChange={(e) => setMaxPriceFilter(Number(e.target.value))} 
                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00C9A7]"
                        />
                        <div className="text-[11px] text-gray-400 text-center font-medium mt-2">
                           Sembunyikan kelas di atas {formatSliderPrice(currentMaxPrice)}
                        </div>
                     </div>
                  )}
               </div>

               {/* Rating */}
               <div>
                 {renderAccordionHeader('rating', 'Minimal Rating')}
                 {openAccordion.includes('rating') && (
                    <div className="space-y-3 pb-4">
                        {[5, 4, 3].map((r) => {
                           const isActive = minRating === r;
                           return (
                              <div key={r} onClick={() => setMinRating(isActive ? 0 : r)} className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition ${isActive ? 'bg-teal-50 border border-teal-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                                 {isActive ? <CheckSquare size={16} className="text-[#00C9A7]" /> : <Square size={16} className="text-gray-300" />}
                                 {renderStars(r)}
                                 <span className={`text-xs font-bold ${isActive ? 'text-[#00C9A7]' : 'text-gray-500'}`}>{r}.0+</span>
                              </div>
                           );
                        })}
                    </div>
                 )}
              </div>
            </div>

            {/* Reset Button */}
            {(selectedMainCat !== "All" || selectedLevels.length > 0 || (maxPriceFilter !== null && maxPriceFilter < maxCoursePrice) || searchTerm !== "" || minRating !== 0) && (
               <button onClick={() => { setSearchTerm(""); setSelectedMainCat("All"); setSelectedSubCat("All"); setSelectedLevels([]); setMaxPriceFilter(null); setMinRating(0); }} className="w-full mt-4 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-100 transition border border-gray-200">
                  Reset Semua Filter
               </button>
            )}
         </div>
      </aside>

      {/* GRID KELAS */}
      <section className="flex-1 w-full flex flex-col gap-6">
         
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Materi Siap Kerja</h2>
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
               Menampilkan <span className="text-[#00C9A7] text-sm">{filteredCourses.length}</span> Kelas
            </span>
         </div>

         {filteredCourses.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><Search size={24} /></div>
              <h3 className="font-bold text-gray-700 text-lg">Tidak ada kelas ditemukan</h3>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">Coba sesuaikan batas rentang harga atau filter lainnya.</p>
           </div>
         ) : (
           <>
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
               {displayedCourses.map((course) => {
                 const isOwned = ownedCourseIds.includes(course.id);
                 const targetHref = isOwned ? `/dashboard/learning-path/${course.id}` : `/dashboard/checkout/${course.id}`;

                 return (
                   <Link 
                     href={targetHref}
                     key={course.id} 
                     className={`group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#00C9A7]/30 transition-all duration-300 hover:-translate-y-1 relative ${isOwned ? 'opacity-80 grayscale-[20%]' : ''}`}
                   >
                     <div className="relative w-full aspect-video bg-gray-50 border-b border-gray-100 overflow-hidden shrink-0">
                       {course.thumbnail_url ? (
                         <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1"><BookOpen size={24} className="opacity-40" /><span className="text-[10px] font-bold">No Cover</span></div>
                       )}
                       {isOwned && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                             <span className="bg-white text-gray-900 font-black px-3 py-1.5 rounded-lg shadow-lg text-xs flex items-center gap-1.5"><Tag size={12}/> DIMILIKI</span>
                          </div>
                       )}
                     </div>

                     <div className="p-4 flex flex-col flex-1">
                       <p className="text-[10px] text-[#00C9A7] font-black uppercase mb-1.5 tracking-wider">{course.main_categories?.name || "UMUM"}</p>
                       <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-snug group-hover:text-[#00C9A7] transition-colors mb-3 flex-1">{course.title}</h3>

                       <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4 mt-auto">
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100"><Layers size={11} className="text-[#00C9A7]"/> {course.course_levels?.name || "All Level"}</span>
                          <span className="flex items-center gap-1 bg-yellow-50 text-[#b4690e] px-2 py-1 rounded-md border border-yellow-100 font-bold">{Number(course.rating || 5).toFixed(1)} <Star size={11} className="fill-yellow-400 text-yellow-400"/></span>
                       </div>

                       <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                          <div>
                             <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">{course.sub_categories?.name || "Kategori Umum"}</p>
                             <p className={`text-base font-black tracking-tight ${isOwned ? 'text-gray-800' : 'text-[#F97316]'}`}>{formatRupiah(course.price)}</p>
                          </div>
                          
                          {/* TOMBOL KERANJANG SEDERHANA */}
                          {isOwned ? (
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-[#00C9A7] text-white shadow-sm"><BookOpen size={14} /></div>
                          ) : (
                             <button 
                               onClick={(e) => handleAddToCart(e, course)} 
                               title="Tambahkan ke Keranjang" 
                               className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white border border-orange-100 group/cart z-10"
                             >
                                <ShoppingCart size={16} className="group-hover/cart:scale-110 transition-transform" />
                             </button>
                          )}
                       </div>
                     </div>
                   </Link>
                 );
               })}
             </div>

             {visibleCount < filteredCourses.length && (
               <div className="mt-8 flex justify-center pb-8">
                  <button onClick={() => setVisibleCount(v => v + 12)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors flex items-center gap-2 text-sm shadow-sm">
                     Tampilkan Lebih Banyak <ArrowRight size={16} />
                  </button>
               </div>
             )}
           </>
         )}
      </section>

    </div>
  );
}