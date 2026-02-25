"use client";

import { useState, useTransition } from "react";
import { toggleCourseStatus } from "../actions";
import toast from "react-hot-toast";

export default function PublishToggle({ courseId, initialStatus }: { courseId: string, initialStatus: boolean }) {
  const [isPublished, setIsPublished] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic Update: Ubah UI duluan agar terasa cepat
    const newStatus = !isPublished;
    setIsPublished(newStatus);

    startTransition(async () => {
      const result = await toggleCourseStatus(courseId, newStatus);
      
      if (result?.error) {
        toast.error("Gagal mengubah status: " + result.error);
        setIsPublished(!newStatus); // Kembalikan posisi semula jika server gagal
      } else {
        toast.success(newStatus ? "Kelas ditayangkan! (Live)" : "Kelas disembunyikan (Draft)");
      }
    });
  };

  return (
     <div className="flex flex-col items-center gap-1">
         <label 
            className={`relative inline-flex items-center ${isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`} 
            title={isPublished ? "Tayang (Live)" : "Draft (Off)"}
         >
            <input 
               type="checkbox" 
               checked={isPublished}
               onChange={handleToggle}
               disabled={isPending}
               className="sr-only peer" 
            />
            {/* Desain Toggle dari Tailwind */}
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C9A7]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C9A7]"></div>
         </label>
         {/* Label Text kecil di bawahnya */}
         <span className={`text-[10px] font-medium ${isPublished ? "text-[#00C9A7]" : "text-gray-400"}`}>
            {isPublished ? "Live" : "Draft"}
         </span>
     </div>
  );
}