// app/api/midtrans/token/route.ts


import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!serverKey) {
      return NextResponse.json({ error: "Sistem pembayaran belum dikonfigurasi (Server Key hilang)" }, { status: 500 });
    }

    const body = await request.json();
    const { courseId, price, title, userEmail, userName, userId } = body;

    if (!price || price < 100) {
      return NextResponse.json({ error: "Nominal transaksi tidak valid" }, { status: 400 });
    }

    const safeCourseId = (courseId || "TRX").toString().substring(0, 4).replace(/[^a-zA-Z0-9]/g, '');
    const order_id = `KLAS-${Date.now()}-${safeCourseId}`;

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: price,
      },
      item_details: [{
        id: (courseId || "id-unknown").substring(0, 50),
        price: price,
        quantity: 1,
        name: (title || "Pembelian KlasKonstruksi").substring(0, 50), 
      }],
      customer_details: {
        first_name: (userName || "Siswa").substring(0, 50),
        email: userEmail || "no-email@klas.id",
      },
    };

    const midtransUrl = serverKey.startsWith("SB-") 
      ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
      : "https://app.midtrans.com/snap/v1/transactions";

    // Tetap menggunakan btoa yang aman untuk Cloudflare Workers
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
      console.error("Midtrans API Error:", data);
      return NextResponse.json(
        { error: data.error_messages?.[0] || data.status_message || "Gagal membuat token Midtrans" },
        { status: res.status }
      );
    }

    if (userId && supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const { error: dbError } = await supabaseAdmin.from("transactions").insert({
        order_id: order_id,
        user_id: userId,
        item_id: courseId,
        item_type: courseId === "BUNDLE-CART" ? "bundle" : "course",
        amount: price,
        status: "PENDING"
      });

      if (dbError) {
        console.error("Peringatan: Gagal insert transaksi PENDING:", dbError.message);
      }
    } else if (!userId) {
      console.warn("Peringatan: userId tidak dikirim dari frontend. Transaksi PENDING tidak dicatat di database!");
    }

    return NextResponse.json({ token: data.token, order_id: order_id });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Sistem API Error:", msg);
    return NextResponse.json({ error: "Sistem sedang sibuk, gagal memproses pembayaran." }, { status: 500 });
  }
}