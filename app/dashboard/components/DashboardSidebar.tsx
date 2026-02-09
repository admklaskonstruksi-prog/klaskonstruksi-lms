"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Settings, LogOut, BookOpen, Crown, Layers, 
  BarChart3, Users, ListVideo 
} from "lucide-react";

interface DashboardSidebarProps {
  user: {
    fullName: string;
    role: string;
  };
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-72 fixed h-full bg-white border-r border-gray-200 hidden md:flex flex-col z-50 shadow-sm">
      
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
         <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-gray-800">
              Klas<span className="text-[#00C9A7]">Konstruksi</span>
            </span>
         </div>
      </div>

      <div className="p-6 pb-2">
         <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#00C9A7]/10 flex items-center justify-center text-[#00C9A7] font-bold">
               {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-bold text-gray-800 truncate">{user.fullName}</p>
               <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
         </div>
      </div>

      <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
        
        <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label={user.role === 'admin' ? "Ringkasan" : "Jelajah Kelas"} active={isActive("/dashboard") && pathname === "/dashboard"} />
        
        {user.role !== 'admin' && (
           <NavItem href="/dashboard/learning-path" icon={<BookOpen size={18} />} label="Kelas Saya" active={isActive("/dashboard/learning-path")} />
        )}
        
        {/* MENU ADMIN LENGKAP */}
        {user.role === 'admin' && (
           <>
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Admin Studio</p>
              
              {/* MENU BARU: DAFTAR KELAS */}
              <NavItem href="/dashboard/courses" icon={<ListVideo size={18} />} label="Daftar Kelas" active={isActive("/dashboard/courses") && pathname === "/dashboard/courses"} />
              
              <NavItem href="/dashboard/courses/create" icon={<Crown size={18} />} label="Buat Kelas Baru" active={isActive("/dashboard/courses/create")} />
              <NavItem href="/dashboard/categories" icon={<Layers size={18} />} label="Kelola Kategori" active={isActive("/dashboard/categories")} />
              
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Laporan & Data</p>
              <NavItem href="/dashboard/analytics/users" icon={<Users size={18} />} label="Analitik Pengguna" active={isActive("/dashboard/analytics/users")} />
              <NavItem href="/dashboard/analytics/sales" icon={<BarChart3 size={18} />} label="Laporan Penjualan" active={isActive("/dashboard/analytics/sales")} />
           </>
        )}

        <div className="mt-6">
           <NavItem href="/dashboard/settings" icon={<Settings size={18} />} label="Pengaturan" active={isActive("/dashboard/settings")} />
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <form action="/auth/signout" method="post"> 
          <button className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium group">
            <LogOut size={18} /> Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${active ? 'bg-[#00C9A7]/10 text-[#00C9A7]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
      <span className={active ? "text-[#00C9A7]" : "text-gray-400"}>{icon}</span>
      {label}
    </Link>
  )
}

