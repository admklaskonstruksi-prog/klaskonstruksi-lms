"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  Target, Zap, Layers, CheckCircle, Menu, X, ArrowRight
} from "lucide-react";

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#00C9A7] selection:text-white">
      
      {/* --- NAVBAR (Disamakan dengan Homepage) --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                 src="/logo.png" 
                 alt="Logo Klas Konstruksi" 
                 width={160} 
                 height={160} 
                 className="object-contain" 
                 priority
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Beranda
              </Link>
              <Link href="/#program" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Program Klas
              </Link>
              <Link href="/#mentor" className="text-gray-600 hover:text-[#00C9A7] font-medium transition-colors">
                Daftar Mentor
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2.5 text-gray-600 font-bold hover:text-[#00C9A7] transition-colors">
                Masuk
              </Link>
              <Link href="/login?mode=register" className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#00C9A7]/30 flex items-center gap-2 hover:-translate-y-0.5">
                Daftar Sekarang <ArrowRight size={16} />
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-[#00C9A7] focus:outline-none">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Beranda</Link>
              <Link href="/#program" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Program Klas</Link>
              <Link href="/#mentor" className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-[#00C9A7] hover:bg-gray-50 rounded-lg">Daftar Mentor</Link>
              <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                <Link href="/login" className="w-full text-center py-3 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Masuk</Link>
                <Link href="/login?mode=register" className="w-full text-center py-3 bg-[#00C9A7] text-white font-bold rounded-lg hover:bg-[#EA580C]">Daftar Sekarang</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- KONTEN ABOUT US --- */}
      <main className="max-w-6xl mx-auto py-20 px-6 space-y-24">
        
        {/* SECTION 1: FOUNDER MESSAGE (Tanpa Foto) */}
        <section className="max-w-4xl mx-auto space-y-10">
            <div className="text-center">
                <p className="text-[#00C9A7] font-bold tracking-widest uppercase text-sm mb-3">Ir. Arif Budianto — Founder, KLAS</p>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                    a message from <span className="text-[#00C9A7]">founder</span>
                </h1>
            </div>

            <div className="prose prose-lg text-gray-600 leading-relaxed mx-auto">
                <p className="font-bold text-gray-900 text-xl text-center mb-8">Welcome to KLAS.</p>
                <div className="space-y-6 text-justify md:text-left">
                    <p>
                        KLAS was founded to bridge the gap between theory and real project execution in the construction industry. We believe professionals must not only understand concepts, but also know how work is truly done on real projects.
                    </p>
                    <p>
                        At KLAS, learning is driven by real projects and industry-relevant standards. This is not a conventional course platform—it is a learning system designed to prepare professionals for real work and real responsibility.
                    </p>
                    <p>
                        Our approach is guided by <strong>PILLAR</strong>: <em>Project-based Learning that Levels, Aligns, and Refines professionals.</em>
                    </p>
                </div>
            </div>
        </section>

        {/* SECTION 2: VISION & MISSION */}
        <section className="relative bg-gray-900 rounded-[3rem] overflow-hidden text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-2/3 h-full bg-[#F97316] transform -skew-x-12 translate-x-20 z-0 opacity-90"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 p-12 md:p-20 items-center">
                <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter">Vision.</h2>
                <p className="text-gray-400 font-medium">the new super super-app construction edutech</p>
                <p className="text-lg leading-relaxed text-gray-300 mt-6 border-l-4 border-[#00C9A7] pl-6">
                    Building a learning system that develops project-ready construction talent with global competitiveness.
                </p>
                </div>

                <div className="text-right md:text-left text-white md:pl-10">
                <h2 className="text-5xl font-black tracking-tighter text-white md:text-right">Mission.</h2>
                <div className="space-y-6 mt-8">
                    <div className="flex items-start gap-4 flex-row-reverse md:flex-row">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Target className="text-white" /></div>
                        <p className="text-lg font-medium">Translating real project demands into a learning system that is relevant, practical, and measurable.</p>
                    </div>
                    <div className="flex items-start gap-4 flex-row-reverse md:flex-row">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0"><Zap className="text-white" /></div>
                        <p className="text-lg font-medium">Developing construction talent through practice-based learning, real-world project simulations.</p>
                    </div>
                </div>
                </div>
            </div>
        </section>

        {/* SECTION 3: JOURNEY */}
        <section>
            <div className="mb-10 max-w-2xl">
                <h2 className="text-4xl font-black text-gray-900 mb-4">Talent Readiness Journey.</h2>
                <p className="text-xl text-gray-500">From learning to real project performance. Not instant learning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:-translate-y-2 transition duration-300 group">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#00C9A7] mb-6 group-hover:bg-[#00C9A7] group-hover:text-white transition-colors"><Layers size={32} /></div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">FOUNDATION</h3>
                    <p className="text-gray-500 font-medium">Fundamental & Mindset Proyek</p>
                </div>
                
                <div className="bg-[#00C9A7] p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition duration-300 text-white transform scale-105 z-10">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6"><Zap size={32} /></div>
                    <h3 className="text-2xl font-black mb-2">SIMULATION</h3>
                    <p className="text-orange-50 font-medium">Project Simulation & Skill Building</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:-translate-y-2 transition duration-300 group">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#00C9A7] mb-6 group-hover:bg-[#00C9A7] group-hover:text-white transition-colors"><CheckCircle size={32} /></div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">READINESS</h3>
                    <p className="text-gray-500 font-medium">Project-Ready Output</p>
                </div>
            </div>
        </section>

        {/* SECTION 4: PILLAR */}
        <section className="bg-gray-50 rounded-[3rem] p-12 md:p-20 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
                KLAS Learning Framework <span className="text-[#00C9A7]">=PILLAR</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                <PillarCard number="01" title="Project-based" desc="Learning driven by real projects, learning by doing." color="bg-gray-900" />
                <PillarCard number="02" title="Levels" desc="Elevates participants progressively from basics to mastery." color="bg-[#00C9A7]" />
                <PillarCard number="03" title="Aligns" desc="Calibrating standards, workflows, and mindset with industry." color="bg-yellow-500" />
                <PillarCard number="04" title="Refines" desc="Turning mistakes into improvement through feedback." color="bg-red-500" />
            </div>
        </section>

      </main>

      {/* --- FOOTER (Disamakan dengan Homepage) --- */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t-4 border-[#00C9A7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image 
                 src="/logo.png" 
                 alt="Logo Bawah" 
                 width={80} 
                 height={80} 
                 className="rounded object-contain opacity-90 grayscale hover:grayscale-0 transition-all bg-white" 
              />
            </Link>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mt-4">
              Platform e-learning teknik sipil dan konstruksi terlengkap. Kami berdedikasi untuk mencetak engineer dan praktisi handal yang siap menghadapi tantangan proyek nyata.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Menu Navigasi</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#00C9A7] transition-colors">Beranda</Link></li>
              <li><Link href="/#program" className="hover:text-[#00C9A7] transition-colors">Program Klas</Link></li>
              <li><Link href="/#mentor" className="hover:text-[#00C9A7] transition-colors">Daftar Mentor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Informasi Lain</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#00C9A7] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-[#00C9A7] transition-colors">Hubungi Kami</Link></li>
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-[#00C9A7] transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Klas Konstruksi. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
             <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
             <Link href="#" className="hover:text-white transition-colors">YouTube</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PillarCard({ number, title, desc, color }: any) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden group border border-gray-100">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`}></div>
            <h4 className={`text-4xl font-black ${color.replace("bg-", "text-")} mb-4`}>{number}</h4>
            <h5 className="font-bold text-gray-900 text-xl mb-2">{title}</h5>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}