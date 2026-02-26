"use client";

import { useTransition } from "react";
// Import diarahkan ke folder [id] tempat actions.ts berada
import { toggleCoursePublish } from "../[id]/actions"; 
import toast from "react-hot-toast";

export default function PublishToggle({ courseId, isPublished }: { courseId: string, isPublished: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleCoursePublish(courseId, isPublished);
            if (result?.error) {
                toast.error("Gagal mengubah status: " + result.error);
            } else {
                toast.success(isPublished ? "Kelas diubah menjadi Draft" : "Kelas berhasil di-Live-kan!");
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <label className={`relative inline-flex items-center cursor-pointer ${isPending ? 'opacity-50' : ''}`}>
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isPublished} 
                    onChange={handleToggle} 
                    disabled={isPending} 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00C9A7]"></div>
            </label>
            <span className={`text-[11px] font-bold ${isPublished ? 'text-[#00C9A7]' : 'text-gray-400'}`}>
                {isPublished ? "Live" : "Draft"}
            </span>
        </div>
    );
}