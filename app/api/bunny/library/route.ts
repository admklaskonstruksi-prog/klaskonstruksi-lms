import { NextResponse } from 'next/server';

export async function GET() {
  // Menggunakan kredensial dari Utils Bunny Anda
  const apiKey = "f5401951-085f-4ff8-801f9e4de7f5-91e9-446e";
  const libraryId = "606426";

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