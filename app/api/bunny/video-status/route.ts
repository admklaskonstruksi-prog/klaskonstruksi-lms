export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. SECURITY FIX: Otorisasi
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Akses Ditolak" }, { status: 401 });
    }

    const { title } = await request.json();
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

    if (!apiKey || !libraryId) {
      return NextResponse.json(
        { error: 'Missing Video configuration' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title || 'Untitled Lesson' }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Bunny API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create video entry at Bunny.net' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
        videoId: data.guid,
        // Pastikan tidak ada kredensial sensitif di sini
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}