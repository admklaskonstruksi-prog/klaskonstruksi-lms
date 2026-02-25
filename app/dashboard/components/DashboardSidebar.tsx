"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  LayoutDashboard, BookOpen, PlusSquare, Tags, 
  Users, BarChart3, Settings, LogOut, 
  ChevronLeft, ChevronRight, Compass, Library, Loader2
} from "lucide-react";

// 1. Definisikan tipe data props yang diterima dari layout
interface DashboardSidebarProps {
  user: {
    fullName: string;
    role: string;
  };
}

// 2. Masukkan props ke dalam fungsi
export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  
  // 3. Gunakan data dari props sebagai nilai awal (initial state)
  const [role, setRole] = useState<string | null>(user.role);
  const [userName, setUserName] = useState<string>(user.fullName);
  const [isLoading, setIsLoading] = useState(false); // Set false karena data sudah ada dari server
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // useEffect sekarang hanya jadi cadangan (fallback) jika data profile berubah
  useEffect(() => {
    async function refreshUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", authUser.id).single();
        if (profile) {
          setRole(profile.role);
          setUserName(profile.full_name || "Tanpa Nama");
        }
      }
    }
    // Opsional: jalankan jika ingin data selalu fresh
    // refreshUser(); 
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const adminMenus = [
    { title: "MENU", items: [{ name: "Ringkasan", icon: LayoutDashboard, path: "/dashboard" }] },
    { title: "ADMIN STUDIO", items: [
        { name: "Daftar Kelas", icon: BookOpen, path: "/dashboard/courses" },
        { name: "Buat Kelas Baru", icon: PlusSquare, path: "/dashboard/courses/create" },
        { name: "Kelola Kategori", icon: Tags, path: "/dashboard/categories" },
    ]},
    { title: "LAPORAN & DATA", items: [
        { name: "Analitik", icon: Users, path: "/dashboard/users" },
        { name: "Laporan", icon: BarChart3, path: "/dashboard/sales" },
        { name: "Pengaturan", icon: Settings, path: "/dashboard/settings" },
    ]}
  ];

  const studentMenus = [
    { title: "MENU", items: [
        { name: "Jelajah Kelas", icon: Compass, path: "/dashboard" },
        { name: "Kelas Saya", icon: Library, path: "/dashboard/my-courses" },
        { name: "Pengaturan", icon: Settings, path: "/dashboard/settings" },
    ]}
  ];

  const menusToShow = role === "admin" ? adminMenus : studentMenus;

  return (
    <aside 
      className={`bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 ${
        isMinimized ? "w-20" : "w-64"
      }`}
    >
      <div className="h-24 flex items-center justify-between px-4 border-b border-gray-100 shrink-0 relative">
        <div className={`overflow-hidden whitespace-nowrap transition-all ${isMinimized ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <Image 
               src="/logo.png" 
               alt="Klas Konstruksi Logo" 
               width={140} 
               height={45} 
               className="object-contain"
               priority 
            />
        </div>
        
        {isMinimized && (
            <h1 className="font-black text-2xl text-[#00C9A7] absolute left-1/2 -translate-x-1/2">
                KK
            </h1>
        )}

        <button 
          onClick={() => setIsMinimized(!isMinimized)} 
          className="absolute right-4 p-1.5 rounded-lg text-gray-400 hover:bg-teal-50 hover:text-[#00C9A7] transition-colors z-10"
        >
          {isMinimized ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="p-4 shrink-0">
        <div className={`flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 transition-all ${isMinimized ? "justify-center p-2" : ""}`}>
          <div className="w-10 h-10 rounded-full bg-[#00C9A7] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
             {isLoading ? <Loader2 size={16} className="animate-spin" /> : userName.charAt(0).toUpperCase()}
          </div>
          
          <div className={`overflow-hidden transition-all ${isMinimized ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <p className="text-sm font-bold text-gray-900 whitespace-nowrap truncate">{userName}</p>
            {/* Pakai Orange untuk Role agar kontras */}
            <p className="text-xs text-[#F97316] font-bold capitalize">{role || "Siswa"}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6 scrollbar-hide">
        {menusToShow.map((group, idx) => (
          <div key={idx}>
            <div className={`overflow-hidden transition-all ${isMinimized ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 mb-2"}`}>
               <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {group.title}
               </h3>
            </div>

            <div className="space-y-1">
              {group.items.map((item, i) => {
                const isActive = pathname === item.path;
                return (
                  <Link 
                    href={item.path} 
                    key={i} 
                    title={isMinimized ? item.name : ""} 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#00C9A7]/10 text-[#00C9A7] font-bold shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#00C9A7] font-medium'
                    } ${isMinimized ? 'justify-center' : ''}`}
                  >
                    <item.icon size={20} className={`shrink-0 ${isActive ? 'text-[#00C9A7]' : 'text-gray-400'}`} />
                    
                    <span className={`whitespace-nowrap overflow-hidden transition-all ${isMinimized ? "w-0 opacity-0" : "w-auto opacity-100"} text-sm`}>
                       {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 shrink-0">
        <button 
          onClick={handleLogout} 
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full ${isMinimized ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="shrink-0" />
          <span className={`whitespace-nowrap overflow-hidden transition-all ${isMinimized ? "w-0 opacity-0" : "w-auto opacity-100"} text-sm font-bold`}>
             Keluar Akun
          </span>
        </button>
      </div>
    </aside>
  );
}