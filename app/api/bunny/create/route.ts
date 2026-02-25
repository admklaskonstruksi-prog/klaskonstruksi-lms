import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    // API Key tetap rahasia, ambil dari environment
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = "594715"; 

    if (!apiKey) {
      return NextResponse.json({ error: 'BUNNY_API_KEY di Vercel masih kosong!' }, { status: 500 });
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

    // --- PERBAIKAN DEBUGGING: TAMPILKAN ERROR ASLI DARI BUNNY ---
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Bunny Refused (${response.status}): ${errorText}` 
      }, { status: response.status });
    }

    const data = await response.json();

    // 2. BERIKAN SEMUA DATA PENTING KE FRONTEND
    return NextResponse.json({
      videoId: data.guid,
      libraryId: libraryId,
      apiKey: apiKey
    });

  } catch (error: any) {
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}