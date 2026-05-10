export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    // 1. SECURITY FIX: Hanya user yang terotentikasi yang bisa melihat library
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Akses Ditolak" }, { status: 401 });
    }

    const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || process.env.BUNNY_LIBRARY_ID;
    const API_KEY = process.env.BUNNY_API_KEY;

    if (!LIBRARY_ID || !API_KEY) {
      return NextResponse.json({ error: "Kredensial belum lengkap" }, { status: 500 });
    }

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        AccessKey: API_KEY,
      },
    };

    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos?page=1&itemsPerPage=100&orderBy=date`,
      { ...options, cache: 'no-store' }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gagal ke BunnyCDN: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}