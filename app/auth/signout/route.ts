import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Cek sesi user saat ini
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Lakukan proses logout di Supabase
    await supabase.auth.signOut();
  }

  // Redirect kembali ke halaman Login setelah logout sukses
  // req.url digunakan sebagai base URL untuk memastikan redirect absolut
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  });
}