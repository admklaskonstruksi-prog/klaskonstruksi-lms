"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { 
  LayoutDashboard, BookOpen, PlusSquare, Tags, 
  Users, BarChart3, Settings, LogOut, 
  Compass, Library, Loader2, ShoppingCart, BookText,
  PanelLeftClose, PanelLeftOpen, Target 
} from "lucide-react";

interface DashboardSidebarProps {
  user: {
    fullName: string;
    role: string;
  };
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [role, setRole] = useState<string | null>(user.role);
  const [userName, setUserName] = useState<string>(user.fullName);
  const [isLoading, setIsLoading] = useState(false); 
  const [cartCount, setCartCount] = useState(0);
  
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("klas_cart") || "[]");
      setCartCount(cart.length);
    };
    
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

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
  }, [supabase]);

  const handleLogout = async () => {
    const toastId = toast.loading("Mengeluarkan akun..."); 
    await supabase.auth.signOut();
    toast.dismiss(toastId);
    window.location.href = "/login"; 
  };

  const adminMenus = [
    { title: "Dashboard", items: [{ name: "Ringkasan", icon: LayoutDashboard, path: "/dashboard" }] },
    { title: "Admin Studio", items: [
        { name: "Daftar Kelas", icon: BookOpen, path: "/dashboard/courses" },
        { name: "Buat Kelas Baru", icon: PlusSquare, path: "/dashboard/courses/create" },
        { name: "Kelola Kategori", icon: Tags, path: "/dashboard/categories" },
    ]},
    { title: "E-Book Studio", items: [
        { name: "Daftar E-Book", icon: Library, path: "/dashboard/ebooks" },
        { name: "Buat E-Book Baru", icon: BookText, path: "/dashboard/ebooks/create" },
    ]},
    { title: "Laporan & Data", items: [
        { name: "Analitik", icon: Users, path: "/dashboard/users" },
        { name: "Laporan", icon: BarChart3, path: "/dashboard/sales" },
        { name: "Pengaturan", icon: Settings, path: "/dashboard/settings" },
    ]}
  ];

  const studentMenus = [
    { title: "Dashboard", items: [
        { name: "Jelajah Kelas", icon: Compass, path: "/dashboard" },
        { name: "Jelajah E-Book", icon: BookText, path: "/dashboard/explore-ebooks" },
        { name: "Kelas Saya", icon: Library, path: "/dashboard/my-courses" },
        { name: "Smart Onboarding", icon: Target, action: "onboarding" }, // <-- TAMBAHAN TOMBOL ONBOARDING
        { name: "Pengaturan", icon: Settings, path: "/dashboard/settings" },
    ]}
  ];

  const menusToShow = role === "admin" ? adminMenus : studentMenus;

  return (
    <>
      <aside className={`bg-[#FDFDFD] border-r border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 ${isMinimized ? "w-[60px]" : "w-64"}`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all ${isMinimized ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
             <div className="text-[#F97316]"><LayoutDashboard size={22} className="fill-current text-[#F97316]" /></div>
             <span className="font-semibold text-gray-900 text-[14px] tracking-tight">KlasKonstruksi</span>
          </div>
          {isMinimized && (<div className="w-full flex justify-center text-[#F97316]"><LayoutDashboard size={20} className="fill-current text-[#F97316]" /></div>)}
        </div>

        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className={`flex items-center gap-2.5 hover:bg-gray-100/80 p-1.5 rounded-lg border border-transparent transition-colors cursor-pointer ${isMinimized ? "justify-center" : ""}`}>
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#00C9A7] to-teal-400 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
               {isLoading ? <Loader2 size={12} className="animate-spin" /> : userName.charAt(0).toUpperCase()}
            </div>
            {!isMinimized && (
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-[13px] font-medium text-gray-900 leading-tight truncate">{userName}</span>
                <span className="text-[11px] text-gray-500 capitalize leading-tight">{role || "Siswa"}</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-4 scrollbar-hide">
          {menusToShow.map((group, idx) => (
            <div key={idx} className="flex flex-col">
              {!isMinimized && (<h3 className="px-2 mb-1 text-[11px] font-medium text-gray-400">{group.title}</h3>)}
              <div className="space-y-0.5">
                {group.items.map((item: any, i) => {
                  
                  // JIKA TOMBOL MEMILIKI AKSI KHUSUS (SEPERTI ONBOARDING)
                  if (item.action) {
                    return (
                      <button 
                        key={i} 
                        onClick={() => { if (item.action === 'onboarding') window.dispatchEvent(new Event('openOnboarding')); }}
                        title={isMinimized ? item.name : ""} 
                        className={`flex w-full items-center gap-3 px-2 py-1.5 rounded-md transition-all group text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 ${isMinimized ? 'justify-center py-2' : ''}`}
                      >
                        <item.icon size={16} strokeWidth={2} className="shrink-0 text-gray-500 group-hover:text-gray-800" />
                        {!isMinimized && (<span className="text-[13px] whitespace-nowrap truncate tracking-tight">{item.name}</span>)}
                      </button>
                    )
                  }

                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      href={item.path} 
                      key={i} 
                      title={isMinimized ? item.name : ""} 
                      className={`flex items-center gap-3 px-2 py-1.5 rounded-md transition-all group ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'} ${isMinimized ? 'justify-center py-2' : ''}`}
                    >
                      <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`} />
                      {!isMinimized && (<span className="text-[13px] whitespace-nowrap truncate tracking-tight">{item.name}</span>)}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-200 shrink-0 flex flex-col gap-1">
          <button onClick={handleLogout} title={isMinimized ? "Keluar Akun" : ""} className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-all w-full ${isMinimized ? 'justify-center py-2' : ''}`}>
            <LogOut size={16} className="shrink-0 text-gray-500" />
            {!isMinimized && (<span className="text-[13px] tracking-tight">Logout</span>)}
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Perluas Sidebar" : "Kecilkan Sidebar"} className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-gray-400 hover:bg-gray-100/80 hover:text-gray-900 transition-all w-full mt-1 ${isMinimized ? 'justify-center py-2' : ''}`}>
            {isMinimized ? <PanelLeftOpen size={16} className="shrink-0" /> : <PanelLeftClose size={16} className="shrink-0" />}
            {!isMinimized && (<span className="text-[13px] tracking-tight">Tutup Sidebar</span>)}
          </button>
        </div>
      </aside>

      {role !== "admin" && cartCount > 0 && pathname !== "/cart" && (
        <Link href="/cart" className="fixed top-6 right-6 z-50 bg-[#F97316] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#ea580c] transition-all duration-300 flex items-center justify-center group border border-white/20 hover:shadow-[#F97316]/40">
          <ShoppingCart size={26} className="group-hover:-rotate-12 transition-transform" />
          <span className="absolute -top-1.5 -right-1.5 bg-white text-[#F97316] text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-[#F97316]">{cartCount}</span>
        </Link>
      )}
    </>
  );
}