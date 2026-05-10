import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!serverKey) {
      return NextResponse.json({ error: "Sistem pembayaran belum dikonfigurasi (Server Key hilang)" }, { status: 500 });
    }

    // 1. SECURITY FIX: Verifikasi Otorisasi User (Jangan percaya userId dari body)
    const supabaseAuth = await createServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Anda harus login untuk melakukan transaksi." }, { status: 401 });
    }

    const body = await request.json();
    // userId kita cabut dari destructuring body, kita pakai user.id dari sesi auth
    const { courseId, price: clientPrice, title, userEmail, userName, itemType } = body;

    if (!clientPrice || clientPrice < 100) {
      return NextResponse.json({ error: "Nominal transaksi tidak valid" }, { status: 400 });
    }

    // 2. SECURITY FIX: Validasi Harga Asli dari Database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    let verifiedPrice = 0;
    
    // Tentukan tipe item untuk lookup. Default ke 'course' jika undefined.
    const actualItemType = itemType || (courseId === "BUNDLE-CART" ? "bundle" : "course");

    if (actualItemType === "course") {
        const { data: courseData, error: courseError } = await supabaseAdmin
            .from("courses")
            .select("price")
            .eq("id", courseId)
            .single();
            
        if (courseError || !courseData) {
             return NextResponse.json({ error: "Materi kursus tidak valid atau tidak ditemukan." }, { status: 404 });
        }
        verifiedPrice = courseData.price;
        
    } else if (actualItemType === "ebook") {
        const { data: ebookData, error: ebookError } = await supabaseAdmin
            .from("ebooks")
            .select("price")
            .eq("id", courseId)
            .single();
            
        if (ebookError || !ebookData) {
             return NextResponse.json({ error: "E-book tidak valid atau tidak ditemukan." }, { status: 404 });
        }
        verifiedPrice = ebookData.price;
    } else if (actualItemType === "bundle") {
         // Logika khusus jika kamu punya tabel bundles, atau biarkan pakai clientPrice jika memang bundle dinamis
         verifiedPrice = clientPrice; 
    }

    // Cek apakah ada hacker yang mengubah harga di frontend
    if (verifiedPrice > 0 && verifiedPrice !== clientPrice) {
         console.warn(`🚨 Manipulasi harga terdeteksi untuk user ${user.id} pada item ${courseId}. Client: ${clientPrice}, DB: ${verifiedPrice}`);
         return NextResponse.json({ error: "Terjadi ketidaksesuaian data transaksi." }, { status: 400 });
    }

    const safeCourseId = (courseId || "TRX").toString().substring(0, 4).replace(/[^a-zA-Z0-9]/g, '');
    const order_id = `KLAS-${Date.now()}-${safeCourseId}`;

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: verifiedPrice, // Gunakan harga terverifikasi
      },
      item_details: [{
        id: (courseId || "id-unknown").substring(0, 50),
        price: verifiedPrice,
        quantity: 1,
        name: (title || "Pembelian KlasKonstruksi").substring(0, 50), 
      }],
      customer_details: {
        first_name: (userName || "Siswa").substring(0, 50),
        email: user.email || userEmail || "no-email@klas.id", // Prioritaskan email dari sesi
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

    // Insert ke tabel transactions menggunakan user.id asli dari auth session
    const { error: dbError } = await supabaseAdmin.from("transactions").insert({
        order_id: order_id,
        user_id: user.id, // PASTI ADA dan SAH
        item_id: courseId,
        item_type: actualItemType,
        amount: verifiedPrice,
        status: "PENDING"
    });

    if (dbError) {
        console.error("Peringatan: Gagal insert transaksi PENDING:", dbError.message);
    }

    return NextResponse.json({ token: data.token, order_id: order_id });
    
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Sistem API Error:", msg);
    return NextResponse.json({ error: "Sistem sedang sibuk, gagal memproses pembayaran." }, { status: 500 });
  }
}