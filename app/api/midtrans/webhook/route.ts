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
    // Pastikan SUPABASE_SERVICE_ROLE_KEY sudah dimasukkan ke Cloudflare Pages Environment
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

    // 3. LOGIKA PEMROSESAN STATUS
    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        
        // A. Update status transaksi menjadi PAID
        await supabaseAdmin.from("transactions").update({ status: "PAID" }).eq("order_id", order_id);

// B. BERIKAN AKSES KELAS / EBOOK KE SISWA
if (trxData.item_type === "course") {
  // Masukkan ke tabel enrollments
  await supabaseAdmin.from("enrollments").insert({
    user_id: trxData.user_id,
    course_id: trxData.item_id,
    amount_paid: trxData.amount // HAPUS STATUS: ACTIVE DISINI
  });
  console.log(`✅ Akses KELAS diberikan untuk User: ${trxData.user_id}`);
          
        } else if (trxData.item_type === "ebook") {
          // Masukkan ke tabel ebook_purchases (pastikan tabel ini sudah kamu buat)
          await supabaseAdmin.from("ebook_purchases").insert({
            user_id: trxData.user_id,
            ebook_id: trxData.item_id,
            amount_paid: trxData.amount
          });
          console.log(`✅ Akses E-BOOK diberikan untuk User: ${trxData.user_id}`);
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