import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Pastikan nama variabel di sini SAMA dengan yang dikirim frontend
    // Kita gunakan nama 'title' agar lebih simpel
    const { courseId, price, title, userEmail, userName } = body;

    // Log data untuk debugging di terminal
    console.log("Memproses transaksi untuk:", title);

    const parameter = {
      transaction_details: {
        order_id: `KLAS-${Date.now()}-${courseId?.substring(0, 4) || 'TRX'}`,
        gross_amount: price,
      },
      item_details: [{
        id: courseId || "id-unknown",
        price: price,
        quantity: 1,
        // Gunakan Optional Chaining dan Default Value agar tidak crash
        name: (title || "Kursus Klas Konstruksi").substring(0, 50), 
      }],
      customer_details: {
        first_name: userName || "Siswa",
        email: userEmail || "no-email@klas.id",
      },
      enabled_payments: ["credit_card", "gopay", "shopeepay", "permata_va", "bca_va", "bni_va", "other_va"],
    };

    const token = await snap.createTransactionToken(parameter);
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("CRITICAL MIDTRANS ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}