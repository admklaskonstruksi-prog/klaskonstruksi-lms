"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai"; // <-- Tambahan import baru
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

export default function KlasAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  // 1. KELOLA STATE INPUT SECARA MANUAL
  const [input, setInput] = useState(""); 

  // 2. KONFIGURASI USECHAT VERSI 6.0
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // 3. STATUS LOADING SEKARANG BERASAL DARI 'status'
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. BUAT FUNGSI SUBMIT MANUAL
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl shadow-[#00C9A7]/20 border border-gray-100 w-[350px] sm:w-[400px] h-[500px] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00C9A7] to-teal-600 p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot size={20} /></div>
              <div>
                <h3 className="font-bold text-sm">Klas AI</h3>
                <p className="text-xs text-teal-100">Asisten Belajar Anda</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3 px-4">
                <Bot size={40} className="text-[#00C9A7] opacity-50" />
                <p className="text-sm">Halo! Saya Klas AI. Ada yang bisa saya bantu terkait kelas atau e-book hari ini?</p>
              </div>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[#F97316] text-white' : 'bg-teal-100 text-teal-700'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#F97316] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-none'}`}>
                      
                      {/* 5. CARA BARU MERENDER TEKS DI VERSI 6.0 (menggunakan 'parts' array) */}
                      {m.parts 
                        ? m.parts.map((part: any, i: number) => part.type === 'text' ? <span key={i}>{part.text}</span> : null) 
                        : m.content}

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

          {/* Input Area */}
          {/* 6. GUNAKAN FUNGSI ONSUBMIT MANUAL */}
          <form onSubmit={onSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7] bg-gray-50"
              value={input}
              placeholder="Tanya seputar kelas..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-[#00C9A7] text-white p-2.5 rounded-full hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button Toggle */}
      <button onClick={() => setIsOpen(!isOpen)} className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-300 bg-[#00C9A7] hover:bg-teal-600 text-white p-4 rounded-full shadow-xl shadow-teal-500/30 flex items-center justify-center`}>
        <MessageCircle size={28} />
      </button>
    </div>
  );
}