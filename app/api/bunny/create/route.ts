import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    // API Key tetap rahasia, ambil dari environment
    const apiKey = process.env.BUNNY_API_KEY;
    
    // KITA TULIS LANGSUNG LIBRARY ID-NYA DI SINI (ANTI-GAGAL)
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