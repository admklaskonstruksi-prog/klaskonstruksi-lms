import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // =========================================================================
    // 1. SECURITY: Validasi Signature Key Midtrans (Cegah Injeksi Pembayaran)
    // =========================================================================
    // Server Key Midtrans kamu (pastikan sudah disetting di file .env)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    
    // Rumus wajib dari Midtrans: SHA512(order_id + status_code + gross_amount + server_key)
    const signatureRaw = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
    const calculatedSignature = crypto.createHash("sha512").update(signatureRaw).digest("hex");

    if (body.signature_key !== calculatedSignature) {
      console.warn("⚠️ Serangan terdeteksi: Signature Midtrans tidak valid!");
      return NextResponse.json(
        { error: "Akses ilegal. Signature Midtrans tidak cocok." }, 
        { status: 403 }
      );
    }
    // =========================================================================

    // =========================================================================
    // 2. SECURITY: Update Database menggunakan Service Role
    // =========================================================================
    // Karena Webhook dipanggil oleh server Midtrans (bukan oleh user yang login),
    // kita tidak punya session/cookie. Kita WAJIB menggunakan SUPABASE_SERVICE_ROLE_KEY
    // agar backend memiliki akses "Super Admin" untuk update tabel transaksi (menembus RLS).
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // CATATAN: Pastikan SUPABASE_SERVICE_ROLE_KEY ada di file .env kamu!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const transactionStatus = body.transaction_status;
    const orderId = body.order_id; // Biasanya string seperti "ORDER-12345"
    
    // Tentukan status akhir yang akan disimpan ke database
    let paymentStatus = 'pending';
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      paymentStatus = 'success';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire' || transactionStatus === 'deny') {
      paymentStatus = 'failed';
    }

    // Lakukan update ke tabel database kamu 
    // (Ubah 'transactions' dan 'order_id' sesuai dengan nama tabel di Supabase kamu)
    const { error } = await supabaseAdmin
      .from('transactions') 
      .update({ status: paymentStatus })
      .eq('order_id', orderId); 

    if (error) {
      console.error("Gagal update status di database:", error);
      return NextResponse.json({ error: "Gagal update database" }, { status: 500 });
    }

    // Wajib mengembalikan status 200 OK ke Midtrans agar mereka tidak melakukan pengiriman ulang (retry)
    return NextResponse.json({ status: "success", message: "Webhook Midtrans berhasil divalidasi dan diproses" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}