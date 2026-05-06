import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    // Kita beritahu sistem untuk membaca NEXT_PUBLIC_BUNNY_LIBRARY_ID
    const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || process.env.BUNNY_LIBRARY_ID;
    const API_KEY = process.env.BUNNY_API_KEY;

    if (!LIBRARY_ID || !API_KEY) {
      return NextResponse.json({ error: "Kredensial belum lengkap " }, { status: 500 });
    }

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        AccessKey: API_KEY,
      },
      body: JSON.stringify({ title: title || "Video Baru" }),
    };

    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
      options
    );

    if (!response.ok) {
      throw new Error("Gagal membuat video di BunnyCDN");
    }

    const data = await response.json();

    return NextResponse.json({
      videoId: data.guid,
      libraryId: LIBRARY_ID,
      apiKey: API_KEY, // Mengirim token ke klien untuk proses upload
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}