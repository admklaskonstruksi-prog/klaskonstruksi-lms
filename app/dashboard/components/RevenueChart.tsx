import React from "react";

export default function RevenueChart() {
  return (
    <div className="w-full h-[350px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
      <p className="font-medium">Area Grafik Pendapatan</p>
      <p className="text-xs mt-1">Data visual akan tampil di sini.</p>
      
      {/* Visualisasi Bar Dummy (Hiasan Saja) */}
      <div className="flex items-end gap-2 mt-4 h-20 opacity-50">
        <div className="w-4 h-10 bg-gray-300 rounded-t"></div>
        <div className="w-4 h-16 bg-gray-300 rounded-t"></div>
        <div className="w-4 h-12 bg-gray-300 rounded-t"></div>
        <div className="w-4 h-20 bg-gray-300 rounded-t"></div>
        <div className="w-4 h-14 bg-gray-300 rounded-t"></div>
      </div>
    </div>
  );
}