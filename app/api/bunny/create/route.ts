import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

    if (!apiKey || !libraryId) {
      return NextResponse.json({ error: 'Config Missing' }, { status: 500 });
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
    // Kita kirim balik API Key agar Frontend bisa pakai untuk upload (Direct Upload)
    return NextResponse.json({
      videoId: data.guid,     // ID Video dari Bunny
      libraryId: libraryId,   // ID Library
      apiKey: apiKey          // Kunci untuk upload
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}