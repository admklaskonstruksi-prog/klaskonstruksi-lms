
import { NextResponse } from 'next/server';

export async function GET() {
  // Menggunakan kredensial dari Environment Variables
  const apiKey = process.env.BUNNY_API_KEY || "";
  const libraryId = process.env.BUNNY_LIBRARY_ID || "606426";

  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100&orderBy=date`,
      {
        method: 'GET',
        headers: {
          AccessKey: apiKey,
          'Accept': 'application/json'
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}