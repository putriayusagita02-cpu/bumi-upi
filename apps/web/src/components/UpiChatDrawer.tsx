'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ArrowRight, Sparkles, Coffee, Utensils, Ticket, Clock, MapPin } from './icons';

interface Message {
  id: string;
  sender: 'user' | 'upi';
  text: string;
  timestamp: string;
}

// Helper untuk merender teks berformat rapi (menghapus ** mentah & menyusun daftar bullet)
function renderFormattedMessage(text: string, isUser: boolean) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Cek jika baris adalah item daftar bullet (•, -, *)
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'));
        const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : line;

        // Parse bagian **bold**
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            const boldText = part.slice(2, -2);
            return (
              <strong
                key={pIdx}
                className={
                  isUser
                    ? 'font-bold text-white'
                    : 'font-bold text-[#3E4F30]'
                }
              >
                {boldText}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1.5">
              <span className={`text-[11px] select-none ${isUser ? 'text-white/80' : 'text-[#B4532A]'}`}>
                •
              </span>
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        return <div key={lineIdx}>{renderedLine}</div>;
      })}
    </div>
  );
}

export const UpiChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { customer } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'upi',
      text: 'Sampurasun! 🌿 Wilujeng sumping di Rumah Tamah Bumi Upi.\n\nSaya **Upi**, asisten ramah Anda. Ada yang bisa dibantu hari ini?\n• Mau cari **rekomendasi menu andalan** khas Garut?\n• Mau tanya **promo voucher & traktiran poin**?\n• Mau cek **jam operasional & rute lokasi**?',
      timestamp: 'Baru saja',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          customerName: customer?.name,
          tier: customer?.tier,
          points: customer?.pointsBalance,
        }),
      });
      const data = await res.json();
      const upiMsg: Message = {
        id: `upi-${Date.now()}`,
        sender: 'upi',
        text: data.reply || 'Hatur nuhun! Ada hal lain yang bisa Upi bantu seputar santapan hari ini?',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, upiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `upi-err-${Date.now()}`,
          sender: 'upi',
          text: 'Punten, koneksi Upi sedang beristirahat sejenak. Silakan kirimkan kembali pertanyaan Anda ya!',
          timestamp: 'Baru saja',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    { label: 'Rekomendasi Menu Juara', icon: '🍛', prompt: 'Rekomendasi menu apa yang paling enak dan wajib dicoba?' },
    { label: 'Menu Pedas Garut', icon: '🌶️', prompt: 'Ada menu apa yang pedas nampol khas Garut?' },
    { label: 'Menu Ramah Bocil', icon: '👶', prompt: 'Menu apa yang cocok buat anak-anak tanpa pedas?' },
    { label: 'Promo Voucher Hari Ini', icon: '🎟️', prompt: 'Ada promo voucher apa hari ini?' },
    { label: 'Jam Buka & Lokasi', icon: '📍', prompt: 'Berapa jam buka dan dimana lokasi Bumi Upi?' },
  ];

  return (
    <>
      {/* Floating Trigger Button: Tanya Upi */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl text-white transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-[#D4A24C]/60"
          style={{
            backgroundColor: '#3E4F30',
            boxShadow: '0 10px 28px -4px rgba(62, 79, 48, 0.5), 0 4px 10px -2px rgba(43, 38, 37, 0.15)',
          }}
          aria-label="Tanya Upi"
        >
          <div className="relative">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A24C] text-[#2B2625] text-sm font-bold shadow-xs">
              👵
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#3E4F30] animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight tracking-wide text-[#F5EEDC]">Tanya Upi</p>
            <p className="text-[10px] text-[#D4A24C] leading-tight font-medium">Asisten Rumah Tamah</p>
          </div>
          <Sparkles className="w-4 h-4 text-[#D4A24C] group-hover:rotate-12 transition-transform ml-0.5" />
        </button>
      </div>

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#2B2625]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md h-full bg-[#FBF7EE] border-l border-[#E8DCC2] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header: Tanya Upi */}
            <div className="p-4 bg-gradient-to-r from-[#3E4F30] to-[#2E3C23] text-[#F5EEDC] flex items-center justify-between shadow-md border-b-2 border-[#D4A24C]/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D4A24C] text-xl shadow-xs border border-white/20">
                    👵
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#3E4F30]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold tracking-wide flex items-center gap-1.5 text-white">
                    <span>Tanya Upi</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A24C] text-[#2B2625] font-sans font-bold">
                      Asisten Tamah
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#D0E2C8] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    <span>Online • Dapur Nenek Garut</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[#F5EEDC]/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F5EEDC]/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 shadow-xs transition-all ${
                      m.sender === 'user'
                        ? 'bg-[#B4532A] text-white rounded-br-xs'
                        : 'bg-white border border-[#E8DCC2] text-[#2B2625] rounded-bl-xs'
                    }`}
                  >
                    {renderFormattedMessage(m.text, m.sender === 'user')}
                  </div>
                  <span className="text-[10px] text-[#8C7767] mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-[#E8DCC2] rounded-2xl w-fit text-xs text-[#634E3F] shadow-xs">
                  <span className="animate-spin text-base">🌿</span>
                  <span>Teh Upi sedang mencari jawaban di dapur nenek...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Pills */}
            <div className="p-3 bg-[#FBF7EE] border-t border-[#E8DCC2] space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7767] px-1 block">
                Pertanyaan Populer:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q.prompt)}
                    className="shrink-0 text-xs py-1.5 px-3 rounded-full bg-white border border-[#E0D4BA] text-[#3E4F30] hover:bg-[#3E4F30] hover:text-white hover:border-[#3E4F30] font-medium transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <span>{q.icon}</span>
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-[#E8DCC2] flex items-center gap-2 shadow-xs"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan menu, resep, atau promo..."
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8DCC2] text-xs focus:outline-none focus:ring-2 focus:ring-[#3E4F30] bg-[#FBF7EE] text-[#2B2625] placeholder:text-[#8C7767]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="py-2.5 px-4 rounded-xl bg-[#3E4F30] text-[#F5EEDC] disabled:opacity-50 transition-transform active:scale-95 hover:brightness-110 shadow-xs flex items-center gap-1.5 text-xs font-bold"
              >
                <span>Kirim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
