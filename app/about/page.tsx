import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  MapPin, Phone, Mail, Instagram, Linkedin, Youtube, 
  Target, Zap, Layers, CheckCircle 
} from "lucide-react";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-gray-900">
               KLAS<span className="text-[#00C9A7]">Konstruksi</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-sm font-bold text-gray-600 hover:text-[#00C9A7] transition">
                    Beranda
                </Link>
                <Link href="/#courses" className="text-sm font-bold text-gray-600 hover:text-[#00C9A7] transition">
                    Jelajah Kelas
                </Link>
                <Link href="/about" className="text-sm font-bold text-[#00C9A7] transition">
                    Tentang Kami
                </Link>
                <Link href="/contact" className="text-sm font-bold text-gray-600 hover:text-[#00C9A7] transition">
                    Kontak
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <Link href="/dashboard" className="px-5 py-2.5 bg-[#00C9A7] text-white text-sm font-bold rounded-xl hover:bg-[#00b894] transition shadow-md shadow-green-200">
                        Dashboard Saya
                    </Link>
                ) : (
                    <>
                        <Link href="/login" className="hidden md:block text-sm font-bold text-gray-600 hover:text-[#00C9A7]">
                            Masuk
                        </Link>
                        <Link href="/login" className="px-5 py-2.5 bg-[#00C9A7] text-white text-sm font-bold rounded-xl hover:bg-[#00b894] transition shadow-md shadow-green-200">
                            Daftar / Masuk
                        </Link>
                    </>
                )}
            </div>
        </div>
      </nav>

      {/* --- KONTEN ABOUT US (Sama seperti sebelumnya) --- */}
      <main className="max-w-6xl mx-auto py-20 px-6 space-y-24">
        
        {/* SECTION 1: FOUNDER MESSAGE */}
        <section className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3 relative">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-200 relative shadow-2xl border-4 border-white transform rotate-2">
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100">FOTO FOUNDER</div>
                </div>
                <div className="absolute -bottom-6 right-4 bg-white px-6 py-4 rounded-xl shadow-xl border border-gray-100 text-center z-10">
                    <p className="font-black text-gray-900 text-lg">Ir. ARIF BUDIANTO</p>
                    <p className="text-xs font-bold text-[#00C9A7] uppercase tracking-wider">Founder, KLAS</p>
                </div>
            </div>

            <div className="w-full md:w-2/3 space-y-6">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                a message from <span className="text-[#00C9A7]">founder</span>
                </h1>
                <div className="prose prose-lg text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-800">Welcome to KLAS.</p>
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
            <div className="absolute top-0 right-0 w-2/3 h-full bg-[#00C9A7] transform -skew-x-12 translate-x-20 z-0 opacity-90"></div>
            
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
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6"><Layers size={32} /></div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">FOUNDATION</h3>
                    <p className="text-gray-500 font-medium">Fundamental & Mindset Proyek</p>
                </div>
                
                <div className="bg-[#00C9A7] p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition duration-300 text-white transform scale-105 z-10">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6"><Zap size={32} /></div>
                    <h3 className="text-2xl font-black mb-2">SIMULATION</h3>
                    <p className="text-green-50 font-medium">Project Simulation & Skill Building</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6"><CheckCircle size={32} /></div>
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
                <PillarCard number="01" title="Project-based" desc="Learning driven by real projects, learning by doing." color="bg-blue-600" />
                <PillarCard number="02" title="Levels" desc="Elevates participants progressively from basics to mastery." color="bg-[#00C9A7]" />
                <PillarCard number="03" title="Aligns" desc="Calibrating standards, workflows, and mindset with industry." color="bg-yellow-500" />
                <PillarCard number="04" title="Refines" desc="Turning mistakes into improvement through feedback." color="bg-red-500" />
            </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-gray-900 mb-6">
                        KLAS<span className="text-[#00C9A7]">Konstruksi</span>
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Platform edukasi konstruksi berbasis proyek pertama di Indonesia.
                    </p>
                </div>
                <div className="col-span-1 md:col-span-1">
                    <h4 className="font-bold text-gray-900 mb-6">Hubungi Kami</h4>
                    <ul className="space-y-4 text-sm text-gray-600">
                        <li className="flex items-start gap-3"><MapPin className="text-[#00C9A7] shrink-0" size={18} /><span>Gedung Konstruksi Center Lt. 3,<br/> Jl. Jendral Sudirman Kav 50</span></li>
                        <li className="flex items-center gap-3"><Phone className="text-[#00C9A7] shrink-0" size={18} /><span>+62 812-3456-7890</span></li>
                        <li className="flex items-center gap-3"><Mail className="text-[#00C9A7] shrink-0" size={18} /><span>halo@klaskonstruksi.id</span></li>
                    </ul>
                </div>
                <div className="col-span-1 md:col-span-1">
                    <h4 className="font-bold text-gray-900 mb-6">Social Media</h4>
                    <div className="flex gap-4">
                        <SocialButton icon={Instagram} />
                        <SocialButton icon={Linkedin} />
                        <SocialButton icon={Youtube} />
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">&copy; 2026 KlasKonstruksi Indonesia. All rights reserved.</div>
         </div>
      </footer>
    </div>
  );
}

function PillarCard({ number, title, desc, color }: any) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`}></div>
            <h4 className={`text-4xl font-black ${color.replace("bg-", "text-")} mb-4`}>{number}</h4>
            <h5 className="font-bold text-gray-900 text-xl mb-2">{title}</h5>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}

function SocialButton({ icon: Icon }: any) {
    return (
        <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#00C9A7] hover:text-white transition"><Icon size={18} /></a>
    )
}