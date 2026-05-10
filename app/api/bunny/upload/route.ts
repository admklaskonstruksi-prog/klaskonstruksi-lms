// app/api/bunny/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { uploadVideoToBunny } from "@/app/dashboard/courses/bunnyUtils";

export async function POST(req: Request) {
  try {
    // 1. Keamanan: Pastikan hanya admin/instruktur yang bisa upload
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Akses Ditolak: Anda harus login." }, { status: 401 });
    }

    // 2. Terima file video dari browser
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json({ error: "File video tidak ditemukan" }, { status: 400 });
    }

    // 3. Teruskan ke BunnyCDN menggunakan utilitas server kamu
    const videoId = await uploadVideoToBunny(file, title || "Untitled Video");
    
    if (!videoId) {
      throw new Error("Gagal memproses upload ke sistem BunnyCDN");
    }

    // 4. Kembalikan ID video dengan aman ke client
    return NextResponse.json({ videoId });

  } catch (error: any) {
    console.error("Proxy Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}