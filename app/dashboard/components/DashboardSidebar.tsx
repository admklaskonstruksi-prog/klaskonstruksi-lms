"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { 
  LayoutDashboard, BookOpen, PlusSquare, Tags, 
  Users, BarChart3, Settings, LogOut, 
  Compass, Library, Loader2, ShoppingCart, BookText,
  PanelLeftClose, PanelLeftOpen, Target, Menu, X
} from "lucide-react";

interface DashboardSidebarProps {
  user: {
    fullName: string;
    role: string;
  };
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // STATE KHUSUS MOBILE
  
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
        { name: "Smart Onboarding", icon: Target, action: "onboarding" }, 
        { name: "Pengaturan", icon: Settings, path: "/dashboard/settings" },
    ]}
  ];

  const menusToShow = role === "admin" ? adminMenus : studentMenus;

  return (
    <>
      {/* 1. HEADER KHUSUS MOBILE (Hanya muncul di HP) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 h-16 sticky top-0 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={24} className="text-[#F97316]" />
          <span className="font-bold text-gray-900 text-[16px] tracking-tight">KlasKonstruksi</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* 2. EFEK BAYANGAN GELAP (Hanya muncul saat menu HP terbuka) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* 3. SIDEBAR UTAMA (Di HP jadi laci melayang, di Laptop jadi menu samping normal) */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen bg-[#FDFDFD] border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isMinimized ? "md:w-[60px]" : "w-64"}
      `}>
        
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all ${isMinimized ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
             <div className="text-[#F97316]"><LayoutDashboard size={22} className="fill-current text-[#F97316]" /></div>
             <span className="font-semibold text-gray-900 text-[14px] tracking-tight">KlasKonstruksi</span>
          </div>
          {/* Ikon untuk mode minimize (Hanya tampil di Desktop) */}
          {isMinimized && (<div className="hidden md:flex w-full justify-center text-[#F97316]"><LayoutDashboard size={20} className="fill-current text-[#F97316]" /></div>)}
          
          {/* Tombol Tutup (X) Khusus Mobile */}
          <button className="md:hidden p-1 text-gray-400 hover:text-gray-900 transition-colors" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-3 pt-4 pb-2 shrink-0">
          <div className={`flex items-center gap-2.5 hover:bg-gray-100/80 p-1.5 rounded-lg border border-transparent transition-colors cursor-pointer ${isMinimized ? "md:justify-center" : ""}`}>
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#00C9A7] to-teal-400 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
               {isLoading ? <Loader2 size={12} className="animate-spin" /> : userName.charAt(0).toUpperCase()}
            </div>
            <div className={`flex flex-col justify-center overflow-hidden ${isMinimized ? "md:hidden" : ""}`}>
              <span className="text-[13px] font-bold text-gray-900 leading-tight truncate">{userName}</span>
              <span className="text-[11px] font-medium text-gray-500 capitalize leading-tight mt-0.5">{role || "Siswa"}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-4 scrollbar-hide">
          {menusToShow.map((group, idx) => (
            <div key={idx} className="flex flex-col">
              <h3 className={`px-2 mb-1.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase ${isMinimized ? "md:hidden" : ""}`}>{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item: any, i) => {
                  
                  // JIKA TOMBOL MEMILIKI AKSI KHUSUS
                  if (item.action) {
                    return (
                      <button 
                        key={i} 
                        onClick={() => { 
                          if (item.action === 'onboarding') window.dispatchEvent(new Event('openOnboarding')); 
                          setIsMobileOpen(false); // Tutup menu di HP
                        }}
                        title={isMinimized ? item.name : ""} 
                        className={`flex w-full items-center gap-3 px-2 py-2 rounded-lg transition-all group text-gray-600 hover:bg-teal-50 hover:text-[#00C9A7] ${isMinimized ? 'md:justify-center' : ''}`}
                      >
                        <item.icon size={18} strokeWidth={2} className="shrink-0 text-gray-400 group-hover:text-[#00C9A7] transition-colors" />
                        <span className={`text-[13px] font-medium whitespace-nowrap truncate tracking-tight ${isMinimized ? 'md:hidden' : ''}`}>{item.name}</span>
                      </button>
                    )
                  }

                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      href={item.path} 
                      key={i} 
                      onClick={() => setIsMobileOpen(false)} // Tutup menu otomatis setelah di-klik (Khusus HP)
                      title={isMinimized ? item.name : ""} 
                      className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all group ${isActive ? 'bg-[#00C9A7]/10 text-[#00C9A7] font-bold' : 'text-gray-600 hover:bg-teal-50 hover:text-[#00C9A7]'} ${isMinimized ? 'md:justify-center' : ''}`}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 transition-colors ${isActive ? 'text-[#00C9A7]' : 'text-gray-400 group-hover:text-[#00C9A7]'}`} />
                      <span className={`text-[13px] whitespace-nowrap truncate tracking-tight ${isMinimized ? 'md:hidden' : ''}`}>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 shrink-0 flex flex-col gap-1 bg-gray-50/50">
          <button onClick={() => { handleLogout(); setIsMobileOpen(false); }} title={isMinimized ? "Keluar Akun" : ""} className={`flex items-center gap-3 px-2 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full group ${isMinimized ? 'md:justify-center' : ''}`}>
            <LogOut size={18} className="shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className={`text-[13px] font-medium tracking-tight ${isMinimized ? 'md:hidden' : ''}`}>Keluar Akun</span>
          </button>
          
          {/* Tombol Minimize HANYA muncul di Desktop */}
          <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Perluas Sidebar" : "Kecilkan Sidebar"} className={`hidden md:flex items-center gap-3 px-2 py-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all w-full mt-1 ${isMinimized ? 'justify-center' : ''}`}>
            {isMinimized ? <PanelLeftOpen size={18} className="shrink-0" /> : <PanelLeftClose size={18} className="shrink-0" />}
            {!isMinimized && (<span className="text-[13px] font-medium tracking-tight">Tutup Sidebar</span>)}
          </button>
        </div>
      </aside>

      {/* Floating Cart Button (Tetap sama) */}
      {role !== "admin" && cartCount > 0 && pathname !== "/cart" && (
        <Link href="/cart" className="fixed top-6 right-6 z-50 bg-[#F97316] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#ea580c] transition-all duration-300 flex items-center justify-center group border border-white/20 hover:shadow-[#F97316]/40">
          <ShoppingCart size={26} className="group-hover:-rotate-12 transition-transform" />
          <span className="absolute -top-1.5 -right-1.5 bg-white text-[#F97316] text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-[#F97316]">{cartCount}</span>
        </Link>
      )}
    </>
  );
}