import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

// 1. Ambil key dari Environment Variables
const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

// 2. Deteksi otomatis mode Production atau Sandbox
// Kunci Sandbox Midtrans biasanya selalu diawali dengan "SB-"
const isProd = !serverKey.startsWith("SB-") && serverKey.length > 0;

const snap = new Midtrans.Snap({
  isProduction: isProd,
  serverKey: serverKey,
  clientKey: clientKey,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log data untuk debugging di terminal server / Netlify logs
    console.log("Environment Kunci:", isProd ? "PRODUCTION" : "SANDBOX");
    console.log("Server Key status:", serverKey ? "TERBACA" : "KOSONG/UNDEFINED!");
    
    const { courseId, price, title, userEmail, userName } = body;
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