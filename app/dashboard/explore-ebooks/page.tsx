import { createClient } from "@/utils/supabase/server";
import EbookExplorer from "./EbookExplorer";
import { redirect } from "next/navigation";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

export default async function ExploreEbooksDashboardPage() {
  const supabase = await createClient();
  
  // 1. Ambil data User untuk Header
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // 2. Ambil semua data E-Book terbaru
  const { data: ebooks } = await supabase
    .from("ebooks")
    .select("*")
    .order("created_at", { ascending: false });

  // 3. Render komponen interaktif
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full selection:bg-[#F97316] selection:text-white">
       <EbookExplorer 
          ebooks={ebooks || []} 
          userName={profile?.full_name || "Siswa"} 
       />
    </div>
  );
}
