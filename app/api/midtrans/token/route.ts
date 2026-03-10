export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      return NextResponse.json({ error: "MIDTRANS_SERVER_KEY tidak dikonfigurasi" }, { status: 500 });
    }

    const body = await request.json();
    // Menangkap userId yang dikirim dari frontend
    const { courseId, price, title, userEmail, userName, userId } = body;

    // Buat Order ID Unik
    const order_id = `KLAS-${Date.now()}-${(courseId || "TRX").toString().substring(0, 4)}`;

    const parameter = {
      transaction_details: {
        order_id: order_id,
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

    // Deteksi otomatis URL API (Sandbox atau Production)
    const midtransUrl = serverKey.startsWith("SB-") 
      ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
      : "https://app.midtrans.com/snap/v1/transactions";

    const auth = btoa(serverKey + ":");
    const res = await fetch(midtransUrl, {
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

    // WAJIB: SIMPAN TRANSAKSI "PENDING" KE DATABASE AGAR WEBHOOK BISA BEKERJA
    if (userId) {
      // Gunakan Service Role Key untuk menembus RLS
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { error: dbError } = await supabaseAdmin.from("transactions").insert({
        order_id: order_id,
        user_id: userId,
        item_id: courseId,
        item_type: "course",
        amount: price,
        status: "PENDING"
      });

      if (dbError) {
        console.error("Gagal insert transaksi PENDING:", dbError.message);
        // Kita tidak gagalkan transaksi midtrans jika DB gagal tercatat, tapi dicatat di log
      }
    }

    return NextResponse.json({ token: data.token, order_id: order_id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}