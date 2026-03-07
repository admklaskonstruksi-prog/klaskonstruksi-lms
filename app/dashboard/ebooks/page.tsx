import Link from "next/link";
import { Plus, BookText } from "lucide-react";

export default function EbooksPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookText className="text-gray-400" />
          Daftar E-Book
        </h1>
        <Link 
          href="/dashboard/ebooks/create" 
          className="bg-[#00C9A7] hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Buat E-Book Baru
        </Link>
      </div>

      {/* State Kosong (Blank State) jika belum ada E-Book */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
          <BookText size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada E-Book</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Anda belum menambahkan e-book satupun. Mulai buat e-book pertama Anda sekarang untuk dijual kepada siswa.
        </p>
        <Link 
          href="/dashboard/ebooks/create" 
          className="inline-flex bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg items-center gap-2 text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={18} />
          Buat E-Book
        </Link>
      </div>

      {/* Nanti Anda bisa menambahkan tabel daftar E-Book dari Supabase di bawah sini */}
    </div>
  );
}