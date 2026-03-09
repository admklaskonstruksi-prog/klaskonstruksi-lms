export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, FileText } from "lucide-react";
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

    // Ambil file dari form
    const pdfFile = formData.get("pdf_file") as File | null;
    const coverFile = formData.get("cover_image") as File | null;

    // Dapatkan data lama untuk fallback URL jika tidak ada file baru yang diunggah
    const { data: currentEbook } = await supabaseClient.from("ebooks").select("file_url, thumbnail_url").eq("id", ebookId).single();

    let finalPdfUrl = currentEbook?.file_url;
    let finalCoverUrl = currentEbook?.thumbnail_url;

    // Upload PDF Baru (Jika Admin Memilih File Baru)
    if (pdfFile && pdfFile.size > 0) {
      const fileExt = pdfFile.name.split('.').pop();
      const fileName = `pdfs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabaseClient.storage.from("ebooks").upload(fileName, pdfFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient.storage.from("ebooks").getPublicUrl(fileName);
        finalPdfUrl = publicUrl;
      }
    }

    // Upload Cover Baru (Jika Admin Memilih Gambar Baru)
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
      file_url: finalPdfUrl,
      thumbnail_url: finalCoverUrl,
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
              placeholder="Contoh: Panduan RAB Terlengkap"
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
              placeholder="0 untuk gratis"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Deskripsi Singkat / Tujuan Utama</label>
            <textarea 
              name="description" 
              defaultValue={ebook.description || ""} 
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00C9A7] outline-none transition-all resize-none"
              placeholder="Jelaskan apa yang akan dipelajari dari E-Book ini..."
            ></textarea>
          </div>

          {/* AREA UPLOAD FILE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-400" /> Ganti Cover / Thumbnail
              </label>
              <input 
                type="file" 
                name="cover_image" 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#F97316] file:text-white hover:file:bg-[#ea580c] transition-all cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50" 
              />
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Biarkan kosong jika tidak ingin mengganti cover. <br/>
                {ebook.thumbnail_url && (
                  <a href={ebook.thumbnail_url} target="_blank" rel="noreferrer" className="text-[#00C9A7] font-bold hover:underline">
                    Lihat Cover Saat Ini ↗
                  </a>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" /> Ganti File E-Book (PDF)
              </label>
              <input 
                type="file" 
                name="pdf_file" 
                accept="application/pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00C9A7] file:text-white hover:file:bg-[#00b596] transition-all cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50" 
              />
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Biarkan kosong jika tidak ingin mengganti file PDF. <br/>
                {ebook.file_url && (
                  <a href={ebook.file_url} target="_blank" rel="noreferrer" className="text-[#00C9A7] font-bold hover:underline">
                    Lihat PDF Saat Ini ↗
                  </a>
                )}
              </p>
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-3">
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