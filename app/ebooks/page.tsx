import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { BookText, Star, ShoppingCart } from "lucide-react";
import AddToCartMini from "@/app/components/AddToCartMini";

export const runtime = 'edge';

export default async function PublicEbooksCatalog() {
  const supabase = await createClient();
  const { data: ebooks } = await supabase.from("ebooks").select("*").order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Katalog <span className="text-[#00C9A7]">E-Book Eksklusif</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Kumpulan panduan, modul, dan referensi berharga untuk mendukung karir Anda di dunia konstruksi profesional.
          </p>
        </div>

        {(!ebooks || ebooks.length === 0) ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200">
             <BookText size={60} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-xl font-bold text-gray-900 mb-2">E-Book Belum Tersedia</h3>
             <p className="text-gray-500">Nantikan rilis e-book terbaru kami segera.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col group">
                <Link href={`/ebooks/${ebook.id}`} className="block">
                  <div className="aspect-[3/4] relative bg-gray-100 flex items-center justify-center overflow-hidden">
                    {ebook.cover_url ? (
                      <Image src={ebook.cover_url} alt={ebook.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="bg-gradient-to-br from-teal-900 to-gray-900 w-full h-full flex items-center justify-center p-6 text-center">
                        <h3 className="text-white font-bold text-xl drop-shadow-md">{ebook.title}</h3>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#F97316] text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">
                      PDF File
                    </div>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-1">
                  <Link href={`/ebooks/${ebook.id}`} className="block mb-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-[#00C9A7] transition-colors">{ebook.title}</h3>
                  </Link>

                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-[#00C9A7]">
                        {ebook.price === 0 ? "GRATIS" : `Rp ${ebook.price.toLocaleString("id-ID")}`}
                      </span>
                      <div className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                        <Star size={12} className="text-orange-400 fill-orange-400" /> {ebook.rating} • {ebook.sold_count} terjual
                      </div>
                    </div>
                    <AddToCartMini item={ebook} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}