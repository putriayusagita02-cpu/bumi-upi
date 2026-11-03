import React, { useState, useEffect, useRef } from 'react';

export interface OtpToastHelperProps {
  phone?: string;
  otpCode: string;
  onAutoFill?: (code: string) => void;
  onClose?: () => void;
  className?: string;
  expiresInSeconds?: number;
}

export const OtpToastHelper: React.FC<OtpToastHelperProps> = ({
  phone,
  otpCode,
  onAutoFill,
  onClose,
  className = '',
  expiresInSeconds = 600,
}) => {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safeInitialSeconds = typeof expiresInSeconds === 'number' && !Number.isNaN(expiresInSeconds)
    ? Math.max(0, Math.floor(expiresInSeconds))
    : 0;
  const [timeLeft, setTimeLeft] = useState(safeInitialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Silently catch clipboard write errors in restricted contexts
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleFill = () => {
    if (onAutoFill) {
      onAutoFill(otpCode);
    }
    copyToClipboard(otpCode);
  };

  const safeTime = Math.max(0, Math.floor(timeLeft || 0));
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`rounded-[1.25rem] border-2 border-[#B4532A] bg-[#FBF7EE] p-4 shadow-xl text-[#2B2625] transition-all duration-200 ${className}`}
      style={{
        boxShadow: '0 12px 28px -4px rgba(180, 83, 42, 0.2), 0 4px 10px -2px rgba(59, 42, 30, 0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#E8DCC2]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B4532A] text-white text-sm shadow-xs">
            💬
          </span>
          <div>
            <h4
              className="font-serif text-sm font-bold tracking-tight text-[#B4532A]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              WhatsApp OTP Demo Helper
            </h4>
            <p className="text-[11px] text-[#634E3F]">Mode simulasi konsol — otomatis aktif</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup helper OTP"
            className="text-[#8C7767] hover:text-[#2B2625] p-1 rounded-full hover:bg-[#E8DCC2]/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="py-3 space-y-2">
        {phone && (
          <div className="flex items-center justify-between text-xs text-[#634E3F]">
            <span>Nomor Tujuan:</span>
            <span className="font-mono font-semibold text-[#2B2625]">{phone}</span>
          </div>
        )}

        <div className="flex items-center justify-between bg-[#F5EEDC] p-2.5 rounded-lg border border-[#E0D4BA]">
          <span className="text-xs text-[#634E3F]">Kode Verifikasi:</span>
          <span className="font-mono text-xl font-bold tracking-widest text-[#B4532A]">
            {otpCode}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8C7767]">
          <span>Masa berlaku kode:</span>
          <span className="font-medium text-[#2B2625]">{timeFormatted} WIB</span>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleFill}
          className="flex-1 py-2 px-3 text-xs font-semibold text-white rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105"
          style={{ backgroundColor: '#B4532A' }}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Kode Terisi!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              <span>Isi Otomatis</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => copyToClipboard(otpCode)}
          className="py-2 px-3 text-xs font-medium text-[#2B2625] bg-[#E8DCC2]/70 hover:bg-[#E8DCC2] rounded-lg transition-colors"
          title="Salin Kode ke Clipboard"
        >
          Salin
        </button>
      </div>
    </aside>
  );
};

OtpToastHelper.displayName = 'OtpToastHelper';
