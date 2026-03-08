export const runtime = 'edge';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // =========================================================================
    // 1. SECURITY: Validasi Signature Key Midtrans (Cegah Injeksi Pembayaran)
    // =========================================================================
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureRaw = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
    
    // --- MENGGUNAKAN WEB CRYPTO API (Khusus untuk Cloudflare / Edge Runtime) ---
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureRaw);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // ---------------------------------------------------------------------------

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const transactionStatus = body.transaction_status;
    const orderId = body.order_id; 
    
    let paymentStatus = 'pending';
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      paymentStatus = 'success';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire' || transactionStatus === 'deny') {
      paymentStatus = 'failed';
    }

    const { error } = await supabaseAdmin
      .from('transactions') 
      .update({ status: paymentStatus })
      .eq('order_id', orderId); 

    if (error) {
      console.error("Gagal update status di database:", error);
      return NextResponse.json({ error: "Gagal update database" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", message: "Webhook Midtrans berhasil divalidasi dan diproses" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}