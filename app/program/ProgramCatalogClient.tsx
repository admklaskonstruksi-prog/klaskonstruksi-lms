"use client";
export const runtime = 'edge';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
// Tambahkan ikon Users di sini
import { Menu, X, ArrowRight, Search, BookOpen, Layers, Star, CheckSquare, Square, Tag, ChevronDown, ChevronUp, ShoppingCart, Users } from "lucide-react";
import toast from "react-hot-toast";
import CartIndicator from "@/app/components/CartIndicator"; 

interface Props {
  courses: any[];
  mainCategories: any[];
  subCategories: any[];
  levels: any[];
  ownedCourseIds: string[];
}

export default function ProgramCatalogClient({ courses, mainCategories, subCategories, levels, ownedCourseIds }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string[]>(['category', 'level', 'price', 'rating']);
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
     <button onClick={() => toggleAccordion(id)} className="flex items-center justify-between w-full py-4.5 group border-t border-gray-100 mt-2 first:mt-0 first:border-t-0">
        <h3 className="font-extrabold text-gray-950 text-base md:text-lg tracking-tight">{title}</h3>
        {openAccordion.includes(id) ? <ChevronUp size={20} className="text-gray-400 group-hover:text-[#00C9A7]" /> : <ChevronDown size={20} className="text-gray-400 group-hover:text-[#00C9A7]" />}
     </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#00C9A7] selection:text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image src="/logo.png" alt="Logo" width={160} height={160} className="object-contain" priority />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Beranda</Link>
              <Link href="/program" className="text-[#00C9A7] font-bold transition-colors">Program Klas</Link>
              <Link href="/ebooks" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Katalog E-Book</Link>
              <Link href="/#mentor" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Daftar Mentor</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <CartIndicator />
              <Link href="/login" className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors">Masuk</Link>
              <Link href="/login?mode=register" className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/30 flex items-center gap-2 hover:-translate-y-0.5">Daftar Sekarang <ArrowRight size={16} /></Link>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <CartIndicator />
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
              <Link href="/ebooks" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">Katalog E-Book</Link>
              <Link href="/#mentor" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Daftar Mentor</Link>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/login?mode=register" className="w-full text-center py-3 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* KONTEN KATALOG */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col lg:flex-row gap-8">
        
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-28">
              <div className="relative w-full mb-6 border border-gray-100 rounded-xl overflow-hidden bg-gray-50 flex items-center focus-within:ring-2 focus-within:ring-[#00C9A7] transition-all group shadow-inner">
                <Search className="absolute left-4 text-gray-400 group-focus-within:text-[#00C9A7]" size={18} />
                <input type="text" placeholder="Cari materi teknik..." className="w-full pl-12 pr-4 py-3.5 bg-transparent outline-none text-sm font-semibold text-gray-700 placeholder:text-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="divide-y divide-gray-100">
                 {/* Kategori */}
                 <div>
                    {renderAccordionHeader('category', 'Kategori Program')}
                    {openAccordion.includes('category') && (
                       <div className="space-y-3 pb-6 pr-2 max-h-[300px] overflow-y-auto no-scrollbar pt-1">
                          <label className="flex items-center gap-3.5 cursor-pointer group"><input type="radio" name="mainCat" checked={selectedMainCat === "All"} onChange={() => handleMainCatChange("All")} className="w-4.5 h-4.5 text-[#00C9A7] accent-[#00C9A7]" /><span className="text-sm">Semua Program</span></label>
                          {mainCategories.map((cat) => (
                             <div key={cat.id} className="space-y-3">
                                <label className="flex items-center gap-3.5 cursor-pointer group"><input type="radio" name="mainCat" checked={selectedMainCat === cat.id} onChange={() => handleMainCatChange(cat.id)} className="w-4.5 h-4.5 text-[#00C9A7] accent-[#00C9A7]" /><span className="text-sm">{cat.name}</span></label>
                                {selectedMainCat === cat.id && activeSubCats.length > 0 && (
                                   <div className="ml-7 pl-4 border-l-2 border-gray-100 space-y-2.5 mt-2 py-1">
                                      <label className="flex items-center gap-3 cursor-pointer group"><input type="radio" name="subCat" checked={selectedSubCat === "All"} onChange={() => setSelectedSubCat("All")} className="w-4 h-4 text-[#F97316] accent-[#F97316]" /><span className="text-[13px]">Semua Spesialisasi</span></label>
                                      {activeSubCats.map(sub => (<label key={sub.id} className="flex items-center gap-3 cursor-pointer group"><input type="radio" name="subCat" checked={selectedSubCat === sub.id} onChange={() => setSelectedSubCat(sub.id)} className="w-4 h-4 text-[#F97316] accent-[#F97316]" /><span className="text-[13px]">{sub.name}</span></label>))}
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
                       <div className="space-y-3 pb-6 pt-1">
                          {levels.map((lvl) => {
                             const isChecked = selectedLevels.includes(lvl.id);
                             return (<button key={lvl.id} onClick={() => handleLevelToggle(lvl.id)} className="flex items-center gap-3.5 w-full text-left group">{isChecked ? <CheckSquare size={19} className="text-[#00C9A7]" /> : <Square size={19} className="text-gray-300" />}<span className="text-sm">{lvl.name}</span></button>)
                          })}
                       </div>
                    )}
                 </div>
                 
                 {/* Slider Range Harga */}
                 <div>
                    {renderAccordionHeader('price', 'Rentang Harga')}
                    {openAccordion.includes('price') && (
                       <div className="space-y-4 pb-6 pt-2">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-2">
                             <span>Rp 0</span>
                             <span className="text-[#00C9A7] bg-teal-50 px-2 py-1 rounded-md">{formatSliderPrice(currentMaxPrice)}</span>
                          </div>
                          <input 
                             type="range" 
                             min="0" 
                             max={maxCoursePrice > 0 ? maxCoursePrice : 100} 
                             step="1000"
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

                 {/* Rating Minimal */}
                 <div>
                    {renderAccordionHeader('rating', 'Rating Minimal')}
                    {openAccordion.includes('rating') && (
                       <div className="space-y-4 pb-6 pt-1">
                           {[5, 4, 3].map((r) => {
                              const isActive = minRating === r;
                              return (
                                 <div key={r} onClick={() => setMinRating(isActive ? 0 : r)} className={`flex items-center gap-3 cursor-pointer group p-2 rounded-xl transition ${isActive ? 'bg-teal-50 border border-teal-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                                    {isActive ? <CheckSquare size={18} className="text-[#00C9A7]" /> : <Square size={18} className="text-gray-300 group-hover:text-[#00C9A7]" />}{renderStars(r)}<span className={`text-xs font-bold transition ${isActive ? 'text-[#00C9A7]' : 'text-gray-600'}`}>{r}.0 Keatas</span>
                                 </div>
                              );
                           })}
                       </div>
                    )}
                 </div>
              </div>

              {(selectedMainCat !== "All" || selectedLevels.length > 0 || (maxPriceFilter !== null && maxPriceFilter < maxCoursePrice) || searchTerm !== "" || minRating !== 0) && (
                 <button onClick={() => { setSearchTerm(""); setSelectedMainCat("All"); setSelectedSubCat("All"); setSelectedLevels([]); setMaxPriceFilter(null); setMinRating(0); }} className="w-full mt-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200">Hapus Semua Filter</button>
              )}
           </div>
        </aside>

        <section className="flex-1 w-full">
           <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menampilkan <span className="text-[#00C9A7]">{filteredCourses.length}</span> Kelas</h2>
           </div>

           {filteredCourses.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200"><div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><Search size={24} /></div><h3 className="font-bold text-gray-600 text-lg">Kelas tidak ditemukan</h3><p className="text-gray-400 text-sm mt-1">Coba sesuaikan batas rentang harga atau filter lainnya.</p></div>
           ) : (
             <>
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {displayedCourses.map((course) => {
                   const isOwned = ownedCourseIds.includes(course.id);
                   const targetHref = isOwned ? `/dashboard/learning-path/${course.id}` : `/program/${course.id}`;

                   return (
                     <Link href={targetHref} key={course.id} className={`group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative ${isOwned ? 'opacity-80 grayscale-[40%]' : ''}`}>
                       <div className="relative w-full aspect-video bg-gray-100 border-b border-gray-100 overflow-hidden shrink-0">
                         {course.thumbnail_url ? (<Image src={course.thumbnail_url} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />) : (<div className="w-full h-full flex flex-col items-center justify-center text-gray-300"><BookOpen size={40} className="mb-2 opacity-50" /></div>)}
                         {isOwned && (<div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10"><span className="bg-white text-[#00C9A7] font-black px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"><Tag size={14}/> DIMILIKI</span></div>)}
                       </div>

                       <div className="p-5 flex flex-col flex-1">
                         <h3 className="font-bold text-gray-800 line-clamp-2 text-[15px] group-hover:text-[#00C9A7] transition-colors mb-3">{course.title}</h3>
                         
                         {/* ----- BAGIAN RATING DAN TERJUAL DI SINI ----- */}
                         <div className="flex items-center text-[10px] sm:text-[11px] text-gray-500 mb-4 mt-auto">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100 mr-2 max-w-[100px] shrink-0">
                               <Layers size={12} className="text-[#00C9A7] shrink-0"/> 
                               <span className="truncate">{course.course_levels?.name || "All Level"}</span>
                            </span>
                            
                            <div className="flex items-center gap-1.5 ml-auto shrink-0">
                               <span className="flex items-center gap-1 bg-yellow-50 text-[#b4690e] px-2 py-1.5 rounded-md border border-yellow-100 font-bold" title="Rating & Ulasan">
                                  <Star size={12} className="fill-yellow-400 text-yellow-400"/>
                                  {Number(course.rating || 5).toFixed(1)} <span className="opacity-70 font-medium">({course.review_count || 0})</span>
                               </span>
                               <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1.5 rounded-md border border-blue-100 font-bold" title="Total Siswa Terdaftar">
                                  <Users size={12} /> {course.sales_count || 0}
                               </span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{course.sub_categories?.name || "Kategori Umum"}</p>
                               <p className={`text-lg font-black ${isOwned ? 'text-gray-900' : 'text-[#F97316]'}`}>{formatRupiah(course.price)}</p>
                            </div>
                            
                            {/* TOMBOL KERANJANG SEDERHANA */}
                            {isOwned ? (
                               <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors bg-[#00C9A7] text-white"><BookOpen size={16} /></div>
                            ) : (
                               <button onClick={(e) => handleAddToCart(e, course)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white border border-orange-100 group/cart z-10"><ShoppingCart size={18} className="group-hover/cart:scale-110 transition-transform" /></button>
                            )}
                         </div>
                       </div>
                     </Link>
                   );
                 })}
               </div>

               {visibleCount < filteredCourses.length && (
                 <div className="mt-12 flex justify-center pb-10">
                    <button onClick={() => setVisibleCount(v => v + 12)} className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-[#00C9A7] hover:text-[#00C9A7] transition-colors flex items-center gap-2">
                       Lihat Lebih Banyak <ArrowRight size={18} />
                    </button>
                 </div>
               )}
             </>
           )}
        </section>
      </main>

     {/* --- FOOTER (DISAMAKAN DENGAN BERANDA) --- */}
     <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-4 border-[#00C9A7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Kolom Kiri Utama */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
               <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded object-contain opacity-90 bg-white" />
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mt-4">
               Platform e-learning teknik sipil dan konstruksi terlengkap. Kami berdedikasi untuk mencetak engineer handal yang siap menghadapi tantangan proyek nyata.
            </p>
          </div>
          
          {/* Kolom Tengah Navigasi */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Menu Navigasi</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#00C9A7] transition-colors">Beranda</Link></li>
              <li><Link href="/program" className="hover:text-[#00C9A7] transition-colors">Program Klas</Link></li>
              <li><Link href="/ebooks" className="hover:text-[#00C9A7] transition-colors">Katalog E-Book</Link></li>
              <li><Link href="/#mentor" className="hover:text-[#00C9A7] transition-colors">Daftar Mentor</Link></li>
            </ul>
          </div>
          
          {/* Kolom Kanan Info Lain */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Informasi Lain</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#00C9A7] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-[#00C9A7] transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>

        </div>

        {/* Baris Hak Cipta Bawah */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}