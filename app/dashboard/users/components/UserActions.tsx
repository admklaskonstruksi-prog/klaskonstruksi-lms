"use client";

import { useTransition } from "react";
import { Trash2, Edit, Loader2 } from "lucide-react";
import { updateUserRole, deleteUserRecord } from "../actions";
import toast from "react-hot-toast";

export default function UserActions({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition();

    const handleToggleRole = () => {
        const newRole = user.role === "admin" ? "siswa" : "admin";
        if (!confirm(`Ubah role ${user.full_name} menjadi ${newRole.toUpperCase()}?`)) return;

        startTransition(async () => {
            const res = await updateUserRole(user.id, newRole);
            if (res?.error) toast.error(res.error);
            else toast.success(`Role diubah menjadi ${newRole}`);
        });
    };

    const handleDelete = () => {
        if (!confirm(`Hapus data profil ${user.full_name}?`)) return;
        startTransition(async () => {
            const res = await deleteUserRecord(user.id);
            if (res?.error) toast.error(res.error);
            else toast.success("Profil dihapus!");
        });
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <button onClick={handleToggleRole} disabled={isPending} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Ubah Role Akses">
                {isPending ? <Loader2 size={16} className="animate-spin text-gray-400"/> : <Edit size={16}/>}
            </button>
            <button onClick={handleDelete} disabled={isPending} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus User">
                {isPending ? <Loader2 size={16} className="animate-spin text-gray-400"/> : <Trash2 size={16}/>}
            </button>
        </div>
    );
}