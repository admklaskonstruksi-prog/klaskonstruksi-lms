export const runtime = 'edge';

import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

export async function POST(request: Request) {
  try {
    // Pindahkan inisialisasi snap ke DALAM function
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

    console.log("=== DEBUG MIDTRANS ===");
    console.log("Server Key Prefix:", serverKey ? serverKey.substring(0, 15) + "..." : "KOSONG!");
    console.log("Client Key Prefix:", clientKey ? clientKey.substring(0, 15) + "..." : "KOSONG!");

    const snap = new Midtrans.Snap({
      isProduction: true,
      serverKey: serverKey,
      clientKey: clientKey,
    });

    const body = await request.json();
    const { courseId, price, title, userEmail, userName } = body;

    const parameter = {
      transaction_details: {
        order_id: `KLAS-${Date.now()}-${courseId?.substring(0, 4) || 'TRX'}`,
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

    const token = await snap.createTransactionToken(parameter);
    return NextResponse.json({ token });

  } catch (error: any) {
    console.error("CRITICAL MIDTRANS ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}