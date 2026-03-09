export const runtime = 'nodejs';

import { NextResponse } from "next/server";

// Menggunakan REST API langsung (tanpa midtrans-client) untuk mengurangi bundle size di Cloudflare Edge
const MIDTRANS_SNAP_URL = "https://app.midtrans.com/snap/v1/transactions";

export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      return NextResponse.json({ error: "MIDTRANS_SERVER_KEY tidak dikonfigurasi" }, { status: 500 });
    }

    const body = await request.json();
    const { courseId, price, title, userEmail, userName } = body;

    const parameter = {
      transaction_details: {
        order_id: `KLAS-${Date.now()}-${(courseId || "TRX").toString().substring(0, 4)}`,
        gross_amount: price,
      },
      item_details: [{
        id: courseId || "id-unknown",
        price: price,
        quantity: 1,
        name: (title || "Kursus Klas Konstruksi").substring(0, 50),
      }],
      customer_details: {
        first_name: userName || "Siswa",
        email: userEmail || "no-email@klas.id",
      },
    };

    const auth = btoa(serverKey + ":");
    const res = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify(parameter),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error_messages?.[0] || data.status_message || "Gagal membuat token Midtrans" },
        { status: res.status }
      );
    }
    return NextResponse.json({ token: data.token });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
