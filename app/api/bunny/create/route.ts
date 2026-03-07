

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    // Gunakan Environment Variable, JANGAN di-hardcode!
    const apiKey = process.env.BUNNY_API_KEY || "";
    const libraryId = process.env.BUNNY_LIBRARY_ID || "606426"; 

    // 1. Minta Slot Video Baru ke Bunny
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ title: title || 'New Lesson' }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Bunny Refused (${response.status}): ${errorText}` 
      }, { status: response.status });
    }

    const data = await response.json();

    // 2. BERIKAN DATA KE FRONTEND
    return NextResponse.json({
      videoId: data.guid,
      libraryId: libraryId,
      apiKey: apiKey
    });

  } catch (error: any) {
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}