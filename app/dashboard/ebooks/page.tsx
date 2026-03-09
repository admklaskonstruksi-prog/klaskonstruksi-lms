import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { BookText, Star, ShoppingCart } from "lucide-react";

export const runtime = 'nodejs';

export default async function EbooksCatalogPage() {
  const supabase = await createClient();
  
  // Ambil semua data E-Book dari database
  const { data: ebooks } = await supabase
    .from("ebooks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Katalog E-Book <span className="text-[#00C9A7]">Konstruksi</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Tingkatkan pengetahuan dan keahlian Anda melalui panduan tertulis eksklusif dari para ahli di bidang konstruksi.
          </p>
        </div>

        {(!ebooks || ebooks.length === 0) ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <BookText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada E-Book</h3>
            <p className="text-gray-500">Saat ini belum ada E-Book yang dirilis. Nantikan update kami selanjutnya!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ebooks.map((ebook) => (
              <Link href={`/ebooks/${ebook.id}`} key={ebook.id} className="group">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                  
                  {/* Thumbnail Dummy / Cover */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-teal-900 to-gray-900 relative flex items-center justify-center p-6 text-center">
                    <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      E-Book
                    </div>
                    <h3 className="text-white font-bold text-xl leading-snug drop-shadow-md">
                      {ebook.title}
                    </h3>
                  </div>

                  <div className="p-6">
                    <h2 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#00C9A7] transition-colors">
                      {ebook.title}
                    </h2>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1 text-orange-400">
                        <Star size={16} className="fill-current" />
                        <span className="font-bold text-gray-700">{ebook.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart size={16} />
                        <span>{ebook.sold_count} terjual</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <span className="text-lg font-black text-[#00C9A7]">
                        {ebook.price === 0 ? "GRATIS" : `Rp ${ebook.price.toLocaleString("id-ID")}`}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-[#00C9A7] group-hover:text-white transition-colors">
                        Lihat Detail
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
