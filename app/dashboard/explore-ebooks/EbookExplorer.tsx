"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, BookText, SlidersHorizontal } from "lucide-react";
import AddToCartMini from "@/app/components/AddToCartMini"; // Tombol cart mini yang sudah kita buat

export default function EbookExplorer({ ebooks, userName }: { ebooks: any[], userName: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all"); // all, free, paid
  const [sortBy, setSortBy] = useState("newest"); // newest, popular, high_rating

  // Logika Filter & Sorting
  const filteredEbooks = ebooks
    .filter((ebook) => {
      const matchSearch = ebook.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = 
        priceFilter === "all" ? true :
        priceFilter === "free" ? ebook.price === 0 :
        priceFilter === "paid" ? ebook.price > 0 : true;
      
      return matchSearch && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return (b.sold_count || 0) - (a.sold_count || 0);
      if (sortBy === "high_rating") return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
    });

  return (
    <div className="w-full">
      {/* HEADER GREETING */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          Halo, <span className="text-[#F97316]">{userName}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Perkaya literasi dan referensi konstruksimu hari ini!</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* ================= LEFT SIDEBAR (FILTERS) ================= */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-6">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari e-book..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7] transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
              <SlidersHorizontal size={18} className="text-[#00C9A7]" /> Filter E-Book
            </div>

            {/* Filter Harga */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-700 mb-3">Status Harga</h4>
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" checked={priceFilter === "all"} onChange={() => setPriceFilter("all")} className="w-4 h-4 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                  <span className="text-sm text-gray-600 group-hover:text-[#00C9A7] font-medium transition-colors">Semua Harga</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" checked={priceFilter === "free"} onChange={() => setPriceFilter("free")} className="w-4 h-4 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                  <span className="text-sm text-gray-600 group-hover:text-[#00C9A7] font-medium transition-colors">Gratis (Free)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" checked={priceFilter === "paid"} onChange={() => setPriceFilter("paid")} className="w-4 h-4 text-[#00C9A7] border-gray-300 focus:ring-[#00C9A7]" />
                  <span className="text-sm text-gray-600 group-hover:text-[#00C9A7] font-medium transition-colors">Berbayar Premium</span>
                </label>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3">Urutkan Berdasarkan</h4>
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="sort" checked={sortBy === "newest"} onChange={() => setSortBy("newest")} className="w-4 h-4 text-[#F97316] border-gray-300 focus:ring-[#F97316]" />
                  <span className="text-sm text-gray-600 group-hover:text-[#F97316] font-medium transition-colors">Terbaru Rilis</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="sort" checked={sortBy === "popular"} onChange={() => setSortBy("popular")} className="w-4 h-4 text-[#F97316] border-gray-300 focus:ring-[#F97316]" />
                  <span className="text-sm text-gray-600 group-hover:text-[#F97316] font-medium transition-colors">Paling Laris</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="sort" checked={sortBy === "high_rating"} onChange={() => setSortBy("high_rating")} className="w-4 h-4 text-[#F97316] border-gray-300 focus:ring-[#F97316]" />
                  <span className="text-sm text-gray-600 group-hover:text-[#F97316] font-medium transition-colors">Rating Tertinggi</span>
                </label>
              </div>
            </div>

          </div>
        </aside>

        {/* ================= RIGHT CONTENT (GRID EBOOKS) ================= */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <BookText className="text-[#00C9A7]" size={22}/> Katalog E-Book
            </h2>
            <div className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              Menampilkan <span className="text-[#00C9A7]">{filteredEbooks.length}</span> Koleksi
            </div>
          </div>

          {filteredEbooks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
              <BookText size={64} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">E-Book Tidak Ditemukan</h3>
              <p className="text-gray-500 text-sm">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
              <button onClick={() => {setSearchQuery(""); setPriceFilter("all"); setSortBy("newest");}} className="mt-6 text-[#00C9A7] font-bold hover:underline">
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEbooks.map((ebook) => (
                <div key={ebook.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#00C9A7]/30 transition-all duration-300 flex flex-col group h-full relative">
                  
                  {/* Cover */}
                  <Link href={`/ebooks/${ebook.id}`} className="block">
                    <div className="aspect-[4/3] relative bg-gray-100 flex items-center justify-center overflow-hidden">
                      {ebook.cover_url ? (
                        <Image src={ebook.cover_url} alt={ebook.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="bg-gradient-to-br from-teal-900 to-gray-900 w-full h-full flex items-center justify-center p-6 text-center">
                          <h3 className="text-white font-bold text-lg drop-shadow-md">{ebook.title}</h3>
                        </div>
                      )}
                      
                      {/* Label Badge */}
                      <div className="absolute top-3 left-3 bg-[#F97316] text-white text-[10px] font-black px-2.5 py-1 rounded shadow-sm tracking-wider uppercase">
                        E-BOOK
                      </div>
                    </div>
                  </Link>

                  {/* Body Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-[#00C9A7] uppercase tracking-wider mb-1.5">E-Book</p>
                    <Link href={`/ebooks/${ebook.id}`} className="block mb-3">
                      <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#00C9A7] transition-colors">
                        {ebook.title}
                      </h3>
                    </Link>

                    {/* Rating & Sold */}
                    <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                       <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold">
                          <Star size={12} className="fill-current" /> {Number(ebook.rating || 5).toFixed(1)}
                       </div>
                       <div className="flex items-center gap-1 text-gray-500 font-medium">
                          <BookText size={12} /> {ebook.sold_count || 0} Terjual
                       </div>
                    </div>

                    {/* Harga & Action (Bottom Sticky) */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-lg font-black text-[#F97316]">
                        {ebook.price === 0 ? (
                          <span className="text-[#00C9A7]">GRATIS</span>
                        ) : (
                          `Rp ${ebook.price.toLocaleString("id-ID")}`
                        )}
                      </span>
                      
                      {/* KOMPONEN ADD TO CART MINI DI SINI */}
                      <AddToCartMini item={ebook} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}