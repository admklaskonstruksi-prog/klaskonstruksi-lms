import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

// 1. Ambil key dari Environment Variables
const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

// 2. Kunci ke mode Production
const snap = new Midtrans.Snap({
  isProduction: true, // Dipaksa selalu Production
  serverKey: serverKey,
  clientKey: clientKey,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 3. Deklarasikan variabel DULU sebelum digunakan di console.log
    const { courseId, price, title, userEmail, userName } = body;
    
    // 4. Log data untuk debugging di terminal / Netlify logs
    console.log("=== DEBUG MIDTRANS ===");
    console.log("Environment Kunci: PRODUCTION (Hardcoded)");
    // Menampilkan awalan karakter kunci agar kita tahu apakah masih nyangkut di "SB-Mid" atau sudah "Mid-ser"
    console.log("Server Key Prefix:", serverKey ? serverKey.substring(0, 10) + "..." : "KOSONG/UNDEFINED!");
    console.log("Memproses transaksi untuk:", title);
    console.log("======================");

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
      // Daftar metode pembayaran yang diizinkan
      enabled_payments: ["credit_card", "gopay", "shopeepay", "permata_va", "bca_va", "bni_va", "other_va"],
    };

    const token = await snap.createTransactionToken(parameter);
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("CRITICAL MIDTRANS ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}