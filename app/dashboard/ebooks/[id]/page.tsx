export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, FileText, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function EditEbookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const ebookId = resolvedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role?.toLowerCase() !== "admin") return redirect("/dashboard");

  // Ambil data E-Book saat ini
  const { data: ebook, error } = await supabase.from("ebooks").select("*").eq("id", ebookId).single();
  
  if (error || !ebook) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">E-Book tidak ditemukan</h2>
        <Link href="/dashboard/ebooks" className="text-[#00C9A7] hover:underline mt-4 inline-block">Kembali ke Daftar</Link>
      </div>
    );
  }

  // =====================================================================
  // SERVER ACTION: Update Ebook + Handling Upload File
  // =====================================================================
  async function updateEbook(formData: FormData) {
    "use server";
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // VALIDASI KEAMANAN
    const { data: authProfile } = await supabaseClient.from("profiles").select("role").eq("id", user?.id).single();
    if (authProfile?.role?.toLowerCase() !== "admin") {
      throw new Error("Akses Ilegal: Hanya admin yang diizinkan memodifikasi data ini.");
    }
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseInt(formData.get("price") as string) || 0;

    // TANGKAP NILAI DUMMY BARU
    const sold_count = parseInt(formData.get("terjual") as string) || 0;
    const dummy_rating = parseFloat(formData.get("dummy_rating") as string) || 5.0;
    const dummy_rating_count = parseInt(formData.get("dummy_rating_count") as string) || 0;

    // Ambil file dari form
    const pdfFile = formData.get("pdf_file") as File | null;
    const coverFile = formData.get("cover_image") as File | null;

    // Ambil URL lama untuk referensi
    const { data: currentEbook } = await supabaseClient.from("ebooks").select("file_url, thumbnail_url, pdf_url, cover_url").eq("id", ebookId).single();

    let finalPdfUrl = currentEbook?.pdf_url || currentEbook?.file_url;
    let finalCoverUrl = currentEbook?.cover_url || currentEbook?.thumbnail_url;

    // Upload PDF Baru
    if (pdfFile && pdfFile.size > 0) {
      const fileExt = pdfFile.name.split('.').pop();
      const fileName = `pdfs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabaseClient.storage.from("ebooks").upload(fileName, pdfFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient.storage.from("ebooks").getPublicUrl(fileName);
        finalPdfUrl = publicUrl;
      }
    }

    // Upload Cover Baru
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split('.').pop();
      const coverName = `covers/cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
      const { error: uploadError } = await supabaseClient.storage.from("ebooks").upload(coverName, coverFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient.storage.from("ebooks").getPublicUrl(coverName);
        finalCoverUrl = publicUrl;
      }
    }

    // Update ke database
    const { error: updateError } = await supabaseClient.from("ebooks").update({
      title,
      description,
      price,
      
      // UPDATE DATA DUMMY
      sold_count,
      rating: dummy_rating,
      reviews_count: dummy_rating_count,
      dummy_rating,
      dummy_rating_count,

      // MEMASTIKAN KOLOM SKEMA LAMA & BARU SAMA-SAMA TERISI
      file_url: finalPdfUrl,
      pdf_url: finalPdfUrl,
      pdf_file_url: finalPdfUrl,
      
      thumbnail_url: finalCoverUrl,
      cover_url: finalCoverUrl,
    }).eq("id", ebookId);

    if (!updateError) {
      revalidatePath("/dashboard/ebooks");
      redirect("/dashboard/ebooks");
    } else {
      console.error("Gagal update ebook:", updateError);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans selection:bg-[#00C9A7] selection:text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/ebooks" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Edit E-Book</h1>
          <p className="text-gray-500 text-sm">Perbarui informasi dan unggah file pengganti jika diperlukan.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <form action={updateEbook} className="p-6 md:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Judul E-Book</label>
            <input 
              type="text" 
              name="title" 
              defaultValue={ebook.title} 
              required 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Harga (Rp)</label>
            <input 
              type="number" 
              name="price" 
              defaultValue={ebook.price} 
              required 
              min="0"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none transition-all"
            />
          </div>

          {/* AREA INPUT DUMMY DATA */}
          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Angka Terjual</label>
              <input 
                type="number" 
                name="terjual" 
                defaultValue={ebook.sold_count || 0}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-white text-gray-900 font-medium text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Rating (Maks 5.0)</label>
              <input 
                type="number" 
                step="0.1"
                max="5"
                name="dummy_rating" 
                defaultValue={ebook.dummy_rating || ebook.rating || 5.0}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-white text-gray-900 font-medium text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Jumlah Review</label>
              <input 
                type="number" 
                name="dummy_rating_count" 
                defaultValue={ebook.dummy_rating_count || ebook.reviews_count || 0}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F97316] outline-none transition bg-white text-gray-900 font-medium text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Deskripsi Singkat / Tujuan Utama</label>
            <textarea 
              name="description" 
              defaultValue={ebook.description || ""} 
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* AREA UPLOAD FILE DENGAN PREVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 mt-6">
            
            {/* KOLOM COVER */}
            <div className="flex flex-col">
              <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-[#F97316]" /> Pengaturan Cover
              </label>
              
              {/* Preview Cover Lama */}
              {(ebook.thumbnail_url || ebook.cover_url) && (
                <div className="mb-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex items-start gap-4">
                   <div className="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-200">
                      <img src={ebook.thumbnail_url || ebook.cover_url} alt="Cover saat ini" className="w-full h-full object-cover" />
                   </div>
                   <div>
                     <p className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                       <CheckCircle2 size={12} /> Cover Aktif
                     </p>
                     <p className="text-xs text-gray-600 leading-relaxed mb-2">Ini adalah cover yang sedang tampil di katalog pembeli.</p>
                     <a href={ebook.thumbnail_url || ebook.cover_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#F97316] hover:underline">
                       Buka Gambar Penuh ↗
                     </a>
                   </div>
                </div>
              )}

              {/* Input Ganti Cover */}
              <div className="mt-auto">
                <p className="text-xs font-bold text-gray-700 mb-2">Ganti dengan file baru:</p>
                <input 
                  type="file" 
                  name="cover_image" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer border border-gray-200 rounded-xl p-2 bg-white" 
                />
                <p className="text-[11px] text-gray-400 mt-2">Biarkan kosong jika tidak ingin mengganti cover.</p>
              </div>
            </div>

            {/* KOLOM PDF */}
            <div className="flex flex-col">
              <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-[#00C9A7]" /> Pengaturan File PDF
              </label>
              
              {/* Preview PDF Lama */}
              {(ebook.file_url || ebook.pdf_url) && (
                <div className="mb-4 bg-teal-50/50 p-4 rounded-2xl border border-teal-100 flex items-start gap-4">
                   <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-teal-100 text-[#00C9A7]">
                      <FileText size={24} />
                   </div>
                   <div>
                     <p className="text-xs font-black text-teal-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                       <CheckCircle2 size={12} /> PDF Aktif
                     </p>
                     <p className="text-xs text-gray-600 leading-relaxed mb-2">Dokumen ini yang akan diunduh oleh pembeli saat ini.</p>
                     <a href={ebook.file_url || ebook.pdf_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#00C9A7] hover:underline">
                       Baca Dokumen Saat Ini ↗
                     </a>
                   </div>
                </div>
              )}

              {/* Input Ganti PDF */}
              <div className="mt-auto">
                <p className="text-xs font-bold text-gray-700 mb-2">Ganti dengan file PDF baru:</p>
                <input 
                  type="file" 
                  name="pdf_file" 
                  accept="application/pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer border border-gray-200 rounded-xl p-2 bg-white" 
                />
                <p className="text-[11px] text-gray-400 mt-2">Biarkan kosong jika tidak ingin mengganti file PDF.</p>
              </div>
            </div>

          </div>

          <div className="pt-8 flex justify-end gap-3 mt-4 border-t border-gray-100">
            <Link href="/dashboard/ebooks" className="px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Batal
            </Link>
            <button type="submit" className="px-8 py-3 font-black text-white bg-[#00C9A7] rounded-xl hover:bg-[#00b596] transition-all flex items-center gap-2 shadow-lg shadow-[#00C9A7]/20 hover:-translate-y-1">
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}