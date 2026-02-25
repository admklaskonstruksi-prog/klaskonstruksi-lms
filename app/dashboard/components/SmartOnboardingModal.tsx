"use client";

import { useState } from "react";
import { Sparkles, GraduationCap, Target, Briefcase, LayoutGrid, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { saveOnboardingResult } from "../onboarding-actions";

interface Props {
  categories: any[];
  isCompleted: boolean;
}

export default function SmartOnboardingModal({ categories, isCompleted }: Props) {
  // Jika sudah siap live, ubah menjadi !isCompleted
  // Untuk keperluan testing/debug agar muncul terus, Anda bisa ubah sementara menjadi 'true'
  const [isOpen, setIsOpen] = useState(!isCompleted); 
  
  // Step 1 sekarang adalah halaman Intro
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [answers, setAnswers] = useState({
    edu: 0,
    goal: 0,
    exp: 0,
    interestId: "",
  });

  if (!isOpen) return null;

  // --- LOGIKA SKORING ---
  const calculateLevel = () => {
    const totalScore = answers.edu + answers.goal + answers.exp;
    if (totalScore <= 4) return "Beginner";
    if (totalScore <= 6) return "Intermediate";
    return "Advanced";
  };

  const handleSelect = (field: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => {
        setStep((s) => s + 1);
    }, 250);
  };

  const handleFinish = async (categoryId: string) => {
    setAnswers((prev) => ({ ...prev, interestId: categoryId }));
    setStep(6); // Step 6 adalah halaman Loading & Hasil
    setIsSaving(true);
    
    const level = calculateLevel();
    await saveOnboardingResult(level, categoryId);
    
    setIsSaving(false);
    
    setTimeout(() => {
        setIsOpen(false);
        window.location.href = `/dashboard?category=${categoryId}&level=${level}`;
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[450px] relative animate-in slide-in-from-bottom-8 duration-500">
        
        {/* PROGRESS BAR (Hanya muncul saat form pertanyaan dimulai, yaitu step 2 sampai 5) */}
        {step > 1 && step < 6 && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
                <div 
                    className="h-full bg-[#00C9A7] transition-all duration-500" 
                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                ></div>
            </div>
        )}

        <div className="p-8 flex-1 flex flex-col">
            
            {/* STEP 1: HALAMAN PENGANTAR (INTRO) */}
            {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-[#00C9A7] mb-6 shadow-xl shadow-teal-100/50">
                        <Sparkles size={40} className="animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Smart Onboarding</h2>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                        Selamat datang! Fitur cerdas ini dirancang untuk menganalisis profil Anda dan memberikan 
                        <strong className="text-gray-800"> Rekomendasi Kelas </strong> 
                        yang paling akurat sesuai dengan tingkat kemampuan serta tujuan karir Anda.
                    </p>
                    
                    <button 
                        onClick={() => setStep(2)} 
                        className="w-full bg-[#00C9A7] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#00C9A7]/20 hover:bg-[#00b596] active:scale-95 transition-all flex justify-center items-center gap-2 group"
                    >
                        Mulai Personalisasi <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-xs text-gray-400 mt-5 font-medium">Hanya butuh waktu kurang dari 1 menit ⚡</p>
                </div>
            )}

            {/* STEP 2: PENDIDIKAN */}
            {step === 2 && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-4 self-start">← Kembali</button>
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00C9A7] mb-6">
                        <GraduationCap size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Apa background pendidikan Anda saat ini?</h2>
                    <p className="text-gray-500 text-sm mb-8">Bantu kami menyesuaikan gaya bahasa dan tingkat materi.</p>
                    
                    <div className="space-y-3 mt-auto">
                        <button onClick={() => handleSelect('edu', 1)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#00C9A7] hover:bg-teal-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Lulusan Baru <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-[#00C9A7] transition-opacity" />
                        </button>
                        <button onClick={() => handleSelect('edu', 2)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#00C9A7] hover:bg-teal-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Profesional <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-[#00C9A7] transition-opacity" />
                        </button>
                        <button onClick={() => handleSelect('edu', 2)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#00C9A7] hover:bg-teal-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Akademisi <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-[#00C9A7] transition-opacity" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: TUJUAN */}
            {step === 3 && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setStep(2)} className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-4 self-start">← Kembali</button>
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mb-6">
                        <Target size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Apa tujuan utama Anda belajar di sini?</h2>
                    <p className="text-gray-500 text-sm mb-8">Kami akan mencarikan kurikulum yang sesuai dengan target Anda.</p>
                    
                    <div className="space-y-3 mt-auto">
                        <button onClick={() => handleSelect('goal', 1)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#F97316] hover:bg-orange-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Memulai Karir Baru <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-[#F97316] transition-opacity" />
                        </button>
                        <button onClick={() => handleSelect('goal', 2)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#F97316] hover:bg-orange-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Naik Level / Promosi <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-[#F97316] transition-opacity" />
                        </button>
                        <button onClick={() => handleSelect('goal', 3)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#F97316] hover:bg-orange-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Mendalami Skill Spesifik <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-[#F97316] transition-opacity" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: PENGALAMAN */}
            {step === 4 && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setStep(3)} className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-4 self-start">← Kembali</button>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                        <Briefcase size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Berapa lama pengalaman kerja Anda?</h2>
                    <p className="text-gray-500 text-sm mb-8">Untuk menghindari materi yang terlalu mudah atau terlalu sulit.</p>
                    
                    <div className="space-y-3 mt-auto">
                        <button onClick={() => handleSelect('exp', 1)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Kurang dari 5 Tahun <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                        </button>
                        <button onClick={() => handleSelect('exp', 2)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            5 - 10 Tahun <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                        </button>
                        <button onClick={() => handleSelect('exp', 3)} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-left font-bold text-gray-700 transition-all group flex justify-between items-center">
                            Lebih dari 10 Tahun <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 5: MINAT KATEGORI */}
            {step === 5 && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setStep(4)} className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-4 self-start">← Kembali</button>
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
                        <LayoutGrid size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Terakhir, apa bidang yang paling Anda minati?</h2>
                    <p className="text-gray-500 text-sm mb-6">Pilih satu fokus utama untuk menyusun rekomendasi Anda.</p>
                    
                    {/* Grid Kategori Dinamis */}
                    <div className="grid grid-cols-2 gap-3 mt-auto max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((cat) => (
                           <button 
                                key={cat.id}
                                onClick={() => handleFinish(cat.id)} 
                                className="p-4 rounded-xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 text-left font-bold text-gray-700 transition-all flex flex-col gap-2"
                            >
                                <span className="text-sm line-clamp-2">{cat.name}</span>
                           </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 6: HASIL & LOADING */}
            {step === 6 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                    {isSaving ? (
                        <>
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-[#00C9A7] blur-xl opacity-20 rounded-full animate-pulse"></div>
                                <Loader2 size={60} className="text-[#00C9A7] animate-spin relative z-10" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Menganalisis Profil Anda...</h2>
                            <p className="text-gray-500 text-sm">Sedang menyusun rekomendasi kelas terbaik.</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-xl shadow-green-100">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Selesai!</h2>
                            <p className="text-gray-500 text-sm mb-6">Kami merekomendasikan Anda untuk mengambil kelas tingkat:</p>
                            
                            <div className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black tracking-widest uppercase text-xl mb-2 shadow-lg">
                                {calculateLevel()}
                            </div>
                            <p className="text-xs text-gray-400 mt-6 animate-pulse">Mengarahkan ke dashboard...</p>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}