'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { WhatsApp, Check, X } from './icons';

export const OtpHelperToastContainer: React.FC = () => {
  const { activeOtpState, dismissOtpHelper } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeOtpState?.visible) {
      setCopied(false);
    }
  }, [activeOtpState]);

  if (!activeOtpState || !activeOtpState.visible) return null;

  const handleFill = () => {
    setCopied(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bumi-autofill-otp', {
          detail: { code: activeOtpState.otpCode },
        })
      );
    }
    setTimeout(() => {
      dismissOtpHelper();
    }, 1200);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-full transition-all duration-300 animate-in slide-in-from-top-6">
      <div
        className="rounded-2xl bg-[#121B22] text-white p-3.5 shadow-2xl border border-white/10 backdrop-blur-md cursor-pointer hover:bg-[#1A2730] transition-colors"
        style={{
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
        onClick={handleFill}
      >
        {/* Push Notification Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[11px] text-[#8696A0]">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsApp className="w-2.5 h-2.5 fill-current" />
            </span>
            <span className="text-[#E9EDEF] font-semibold">WhatsApp</span>
            <span>•</span>
            <span>Baru saja</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissOtpHelper();
            }}
            className="text-[#8696A0] hover:text-white p-0.5 rounded-full"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Push Notification Body */}
        <div className="pt-2 pb-1 text-left space-y-1">
          <p className="text-xs font-bold text-[#E9EDEF] flex items-center justify-between">
            <span>Rumah Tamah Bumi Upi</span>
            <span className="text-[10px] font-mono text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded font-bold">
              OTP: {activeOtpState.otpCode}
            </span>
          </p>
          <p className="text-[11px] text-[#8696A0] leading-snug">
            Sampurasun! Kode verifikasi Anda adalah <strong className="text-white font-mono font-bold">{activeOtpState.otpCode}</strong>. Berlaku 10 menit (WIB).
          </p>
        </div>

        {/* Quick Action Pill */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleFill();
            }}
            className="py-1 px-3 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-[#0B141A] font-bold text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#0B141A]" />
                <span>Kode Terisi!</span>
              </>
            ) : (
              <>
                <span>📋 Salin & Tempel ({activeOtpState.otpCode})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
