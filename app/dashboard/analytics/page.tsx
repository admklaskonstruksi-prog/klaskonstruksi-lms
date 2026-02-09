import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
           <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik Penjualan</h1>
          <p className="text-gray-500">Pantau performa kelas Anda.</p>
        </div>
      </div>

      <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
         <p className="text-gray-500 font-medium">Fitur Analitik sedang dalam perbaikan.</p>
         <p className="text-xs text-gray-400 mt-2">Silakan cek kembali nanti.</p>
      </div>
    </div>
  );
}