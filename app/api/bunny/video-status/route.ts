// File: app/api/bunny/create/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

    if (!apiKey || !libraryId) {
      return NextResponse.json(
        { error: 'Missing Bunny.net configuration' },
        { status: 500 }
      );
    }

    // 1. Request Video ID dari Bunny.net
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

    // 2. Kembalikan Video ID ke Frontend (Browser)
    return NextResponse.json(data);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}