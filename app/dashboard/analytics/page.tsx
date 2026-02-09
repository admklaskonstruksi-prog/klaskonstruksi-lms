import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import RevenueChart from "@/app/dashboard/components/RevenueChart";

export const dynamic = "force-dynamic";

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: any;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [
    coursesRes,
    usersRes,
    enrollmentsData,
    completedRes,
  ] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("id, user_id, created_at, chapter_id, chapters(price)"),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  const enrollments = enrollmentsData.data ?? [];
  const totalRevenue = enrollments.reduce((sum: number, e: any) => sum + (e.chapters?.price ?? 0), 0);
  const activeLearnerIds = new Set(enrollments.map((e: any) => e.user_id));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const last6Months: { label: string; revenue: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthRevenue = enrollments.reduce((sum: number, e: any) => {
      const created = new Date(e.created_at);
      if (created.getFullYear() === y && created.getMonth() === m) {
        return sum + (e.chapters?.price ?? 0);
      }
      return sum;
    }, 0);
    last6Months.push({ label: `${monthNames[m]} ${y}`, revenue: monthRevenue });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Monitor performa platform dan revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={coursesRes.count ?? 0}
          icon={BookOpen}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Users"
          value={usersRes.count ?? 0}
          icon={Users}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Active Learners"
          value={activeLearnerIds.size}
          icon={UserCheck}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Total Revenue"
          value={`Rp ${totalRevenue.toLocaleString("id-ID")}`}
          icon={DollarSign}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />
      </div>

      <RevenueChart data={last6Months} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Enrollments
          </h3>
          <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total pembelian modul</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" /> Missions Selesai
          </h3>
          <p className="text-3xl font-bold text-gray-900">{completedRes.count ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Modul yang sudah diselesaikan</p>
        </div>
      </div>
    </div>
  );
}
