import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@/utils/supabase/server";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { courseId, price, courseTitle } = await request.json();
    
    // LOG DEBUGGING (Cek di Terminal)
    console.log("🚀 Menerima Request Pembayaran:", { courseId, price, courseTitle });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("❌ User tidak login");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pastikan harga bulat (Midtrans menolak desimal)
    const grossAmount = Math.round(Number(price));

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        gross_amount: grossAmount,
      },
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.full_name || "Student",
      },
      item_details: [{
         id: courseId,
         price: grossAmount,
         quantity: 1,
         name: courseTitle.substring(0, 50),
      }]
    };

    console.log("⏳ Meminta Token ke Midtrans...");
    const transaction = await snap.createTransaction(parameter);
    console.log("✅ Token Diterima:", transaction.token);
    
    return NextResponse.json({ token: transaction.token });

  } catch (error: any) {
    // INI YANG MUNCUL DI TERMINAL
    console.error("💥 CRITICAL MIDTRANS ERROR:", error.message);
    console.error("Detail:", error); // Lihat log lengkap
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}