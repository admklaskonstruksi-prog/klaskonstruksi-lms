import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Membaca variabel yang sama
    const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || process.env.BUNNY_LIBRARY_ID;
    const API_KEY = process.env.BUNNY_API_KEY;

    if (!LIBRARY_ID || !API_KEY) {
      return NextResponse.json({ error: "Kredensial BunnyCDN belum lengkap di .env" }, { status: 500 });
    }

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        AccessKey: API_KEY,
      },
    };

    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos?page=1&itemsPerPage=100&orderBy=date`,
      options
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data library dari BunnyCDN");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}