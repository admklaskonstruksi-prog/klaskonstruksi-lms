import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) return NextResponse.json({ error: "Server Key tidak ada" }, { status: 500 });

    // 1. VALIDASI SIGNATURE KEY (Anti-Hacker Bypass)
    const hash = crypto.createHash("sha512");
    const dataToHash = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = hash.update(dataToHash, "utf-8").digest("hex");

    if (calculatedSignature !== signature_key) {
      console.warn(`🚨 Akses Webhook Ditolak! Signature tidak valid.`);
      return NextResponse.json({ error: "Signature Invalid" }, { status: 403 });
    }

    // 2. AKSES DATABASE SEBAGAI SUPERADMIN (Tembus RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // Ambil data transaksi dari database berdasarkan order_id dari Midtrans
    const { data: trxData, error: trxError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (trxError || !trxData) {
      console.error(`🚨 Transaksi tidak ditemukan di database: ${order_id}`);
      return NextResponse.json({ status: "success" }, { status: 200 }); // Tetap 200 agar Midtrans tidak spam error
    }

    // SECURITY FIX: Cek apakah transaksi sudah pernah diproses (PAID) sebelumnya (Idempotency)
    if (trxData.status === "PAID") {
      console.log(`ℹ️ Transaksi ${order_id} sudah diproses sebelumnya (Idempotent Hit).`);
      return NextResponse.json({ status: "success" }, { status: 200 });
    }

    // 3. LOGIKA PEMROSESAN STATUS
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        
        // A. Update status transaksi menjadi PAID
        await supabaseAdmin.from("transactions").update({ status: "PAID" }).eq("order_id", order_id);

        // B. BERIKAN AKSES KELAS / EBOOK KE SISWA
        if (trxData.item_type === "course") {
          // Masukkan ke tabel enrollments
          // Pastikan di database, kombinasi (user_id, course_id) punya Unique Constraint
          const { error: enrollError } = await supabaseAdmin.from("enrollments").upsert({
            user_id: trxData.user_id,
            course_id: trxData.item_id,
            amount_paid: trxData.amount,
            status: 'active', // Menambahkan status jika table membutuhkannya
            progress: 0
          }, { onConflict: 'user_id, course_id' }); // Abaikan error constraint jika sudah ada
          
          if(enrollError) {
             console.error(`🚨 Gagal memberikan akses kelas untuk User: ${trxData.user_id} Error: ${enrollError.message}`);
          } else {
             console.log(`✅ Akses KELAS diberikan untuk User: ${trxData.user_id}`);
          }
          
        } else if (trxData.item_type === "ebook") {
          const { error: ebookError } = await supabaseAdmin.from("ebook_purchases").upsert({
            user_id: trxData.user_id,
            ebook_id: trxData.item_id,
            amount_paid: trxData.amount
          });
          
          if(ebookError){
            console.error(`🚨 Gagal memberikan akses ebook untuk User: ${trxData.user_id} Error: ${ebookError.message}`);
          } else {
             console.log(`✅ Akses E-BOOK diberikan untuk User: ${trxData.user_id}`);
          }
        }
      }
    } 
    else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      // Pembayaran Gagal/Batal -> Update status transaksi jadi FAILED
      await supabaseAdmin.from("transactions").update({ status: "FAILED" }).eq("order_id", order_id);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error: any) {
    console.error("🚨 Webhook Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}