import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Settings as SettingsIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Pengaturan akun dan platform.</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-gray-500">
        <SettingsIcon className="w-12 h-12 mb-4 text-gray-300" />
        <p>Halaman pengaturan. Konten dapat ditambah sesuai kebutuhan.</p>
      </div>
    </div>
  );
}
