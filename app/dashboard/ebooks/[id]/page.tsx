export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
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
        <Link href="/dashboard/ebooks" className="text-blue-600 hover:underline mt-4 inline-block">Kembali ke Daftar</Link>
      </div>
    );
  }

  // =====================================================================
  // SECURITY UPDATE: Role Validation di dalam Server Action
  // =====================================================================
  async function updateEbook(formData: FormData) {
    "use server";
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // VALIDASI KEAMANAN MUTLAK!
    const { data: authProfile } = await supabaseClient.from("profiles").select("role").eq("id", user?.id).single();
    if (authProfile?.role?.toLowerCase() !== "admin") {
      throw new Error("Akses Ilegal: Hanya admin yang diizinkan memodifikasi data ini.");
    }
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseInt(formData.get("price") as string) || 0;
    const thumbnail_url = formData.get("thumbnail_url") as string;
    const file_url = formData.get("file_url") as string;

    const { error: updateError } = await supabaseClient.from("ebooks").update({
      title,
      description,
      price,
      thumbnail_url,
      file_url,
    }).eq("id", ebookId);

    if (!updateError) {
      revalidatePath("/dashboard/ebooks");
      redirect("/dashboard/ebooks");
    } else {
      console.error("Gagal update ebook:", updateError);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/ebooks" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Edit E-Book</h1>
          <p className="text-gray-500 text-sm">Perbarui informasi dan file E-Book Anda.</p>
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="0 untuk gratis"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Deskripsi Singkat</label>
            <textarea 
              name="description" 
              defaultValue={ebook.description || ""} 
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Jelaskan apa yang akan dipelajari dari E-Book ini..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-400" /> URL Cover / Thumbnail
              </label>
              <input 
                type="url" 
                name="thumbnail_url" 
                defaultValue={ebook.thumbnail_url || ""} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="https://.../cover.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <LinkIcon size={16} className="text-gray-400" /> URL File PDF (G-Drive / Bunny.net)
              </label>
              <input 
                type="url" 
                name="file_url" 
                defaultValue={ebook.file_url || ""} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="https://.../dokumen.pdf"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/dashboard/ebooks" className="px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Batal
            </Link>
            <button type="submit" className="px-6 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}