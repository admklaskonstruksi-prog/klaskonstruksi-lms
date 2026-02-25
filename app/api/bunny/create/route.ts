import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

    // --- PERUBAHAN DEBUGGING ---
    // Kode ini akan memberi tahu kita persis variabel mana yang tidak terbaca oleh Vercel
    if (!apiKey || !libraryId) {
      return NextResponse.json({ 
        error: `Config Missing! BUNNY_API_KEY: ${apiKey ? 'Ada ✅' : 'KOSONG ❌'} | NEXT_PUBLIC_BUNNY_LIBRARY_ID: ${libraryId ? 'Ada ✅' : 'KOSONG ❌'}` 
      }, { status: 500 });
    }

    // 1. Minta Slot Video Baru ke Bunny
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title || 'New Lesson' }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Bunny Refused' }, { status: response.status });
    }

    const data = await response.json();

    // 2. BERIKAN SEMUA DATA PENTING KE FRONTEND
    return NextResponse.json({
      videoId: data.guid,
      libraryId: libraryId,
      apiKey: apiKey
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}