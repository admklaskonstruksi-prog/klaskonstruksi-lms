import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function LearningPathPage() {
  const supabase = await createClient();

  // 1. Cek User Login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Ambil Data Enrollment
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      course_id,
      courses (
        id,
        title,
        description,
        thumbnail_url,
        is_published,
        category_id
      )
    `)
    .eq("user_id", user.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelas Saya</h1>
          <p className="text-gray-500">Lanjutkan progres belajar kamu.</p>
        </div>
      </div>

      {/* KONDISI 1: ADA ERROR */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          Terjadi kesalahan saat memuat data. Silakan refresh halaman.
        </div>
      )}

      {/* KONDISI 2: BELUM ADA KELAS (DATA KOSONG) */}
      {!error && (!enrollments || enrollments.length === 0) && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Belum ada kelas aktif</h3>
          <p className="text-gray-500 mt-1 mb-6">Yuk mulai investasi ilmu sekarang!</p>
          <Link href="/dashboard/courses" className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
            Cari Kelas Baru
          </Link>
        </div>
      )}

      {/* KONDISI 3: ADA KELAS (TAMPILKAN GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments?.map((item: any) => {
          const course = item.courses;
          if (!course) return null;

          return (
            <Link
              key={item.id}
              href={`/dashboard/learning-path/${course.id}`}
              className="group block bg-white rounded-xl border border-gray-200 hover:border-green-500 transition-all hover:shadow-md overflow-hidden"
            >
              <div className="aspect-video relative bg-gray-100">
                {course.thumbnail_url ? (
                  <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {course.description || "Tidak ada deskripsi"}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-green-600 font-medium">
                  Lanjutkan Belajar →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}