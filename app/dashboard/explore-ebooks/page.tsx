import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { BookText, Star, ShoppingCart } from "lucide-react";

export const runtime = 'edge';

export default async function ExploreEbooksDashboard() {
  const supabase = await createClient();
  
  // Ambil semua data E-Book
  const { data: ebooks } = await supabase
    .from("ebooks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
          <BookText className="text-[#00C9A7]" size={28} />
          Jelajah E-Book Eksklusif
        </h1>
        <p className="text-gray-500 text-sm">
          Tingkatkan wawasan konstruksi Anda dengan panduan praktis dan komprehensif.
        </p>
      </div>

      {(!ebooks || ebooks.length === 0) ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <BookText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada E-Book</h3>
          <p className="text-gray-500 text-sm">Saat ini belum ada E-Book yang tersedia. Nantikan segera!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ebooks.map((ebook) => (
            <div key={ebook.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              
              {/* Cover Dummy (Kotak Warna) */}
              <div className="aspect-[4/3] bg-gradient-to-br from-teal-900 to-gray-900 relative flex items-center justify-center p-6 text-center">
                <div className="absolute top-3 left-3 bg-[#F97316] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-md">
                  E-Book
                </div>
                <h3 className="text-white font-bold text-lg leading-snug drop-shadow-md line-clamp-3">
                  {ebook.title}
                </h3>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2 group-hover:text-[#00C9A7] transition-colors">
                  {ebook.title}
                </h2>
                
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1 text-[#F97316]">
                    <Star size={14} className="fill-current" />
                    <span className="font-bold text-gray-700">{ebook.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart size={14} />
                    <span>{ebook.sold_count} terjual</span>
                  </div>
                </div>

                {/* Harga & Tombol Beli */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-base font-black text-[#00C9A7]">
                    {ebook.price === 0 ? "GRATIS" : `Rp ${ebook.price.toLocaleString("id-ID")}`}
                  </span>
                  <Link 
                    href={`/ebooks/${ebook.id}`} 
                    className="bg-gray-50 hover:bg-[#00C9A7] text-gray-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}