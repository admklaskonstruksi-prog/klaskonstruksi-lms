"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, GripHorizontal } from "lucide-react";

export default function KlasAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // MENGGUNAKAN FUNGSI MURNI BAWAAN AI SDK (Tanpa error TypeScript berkat 'as any')
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat() as any;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    startPosRef.current = { x: e.clientX, y: e.clientY }; 
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className="fixed z-[9999] pointer-events-none flex flex-col items-end" style={{ bottom: '24px', right: '24px', transform: `translate(${position.x}px, ${position.y}px)` }}>
      
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl shadow-[#00C9A7]/20 border border-gray-100 w-[350px] sm:w-[400px] h-[500px] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 pointer-events-auto">
          
          <div className="bg-gradient-to-r from-[#00C9A7] to-teal-600 p-4 text-white flex justify-between items-center shadow-md z-10 cursor-default">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot size={20} /></div>
              <div>
                <h3 className="font-bold text-sm">Klas AI</h3>
                <p className="text-xs text-teal-100">Asisten Belajar Anda</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3 px-4">
                <Bot size={40} className="text-[#00C9A7] opacity-50" />
                <p className="text-sm">Halo! Saya Klas AI. Ada yang bisa saya bantu terkait materi hari ini?</p>
              </div>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[#F97316] text-white' : 'bg-teal-100 text-teal-700'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#F97316] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-none'}`}>
                      {m.parts ? m.parts.map((part: any, i: number) => part.type === 'text' ? <span key={i}>{part.text}</span> : null) : (m.text || m.content || "")}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7] bg-gray-50 text-gray-900"
              value={input}
              placeholder="Tanya seputar kelas..."
              onChange={handleInputChange}
            />
            <button type="submit" disabled={isLoading || !input?.trim()} className="bg-[#00C9A7] text-white p-2.5 rounded-full hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}

      <button 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className={`${isOpen ? 'hidden' : 'flex'} pointer-events-auto bg-[#00C9A7] hover:bg-teal-600 text-white p-4 rounded-full shadow-xl shadow-teal-500/30 items-center justify-center cursor-grab active:cursor-grabbing relative group transition-transform hover:scale-105 active:scale-95`}
      >
        <div className="absolute -top-1 -right-1 bg-white text-[#00C9A7] rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal size={12} />
        </div>
        <MessageCircle size={28} className="pointer-events-none" />
      </button>
    </div>
  );
}