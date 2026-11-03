import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'otp';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  toast: {
    success: (message: string, options?: Partial<ToastOptions>) => string;
    error: (message: string, options?: Partial<ToastOptions>) => string;
    warning: (message: string, options?: Partial<ToastOptions>) => string;
    info: (message: string, options?: Partial<ToastOptions>) => string;
    otp: (message: string, otpCode: string, onAutoFill?: () => void) => string;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration = options.duration !== undefined ? options.duration : 5000;

      const newToast: ToastItem = {
        ...options,
        id,
        createdAt: Date.now(),
        type: options.type || 'info',
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toast = {
    success: useCallback((message: string, opts?: Partial<ToastOptions>) => showToast({ ...opts, message, type: 'success' }), [showToast]),
    error: useCallback((message: string, opts?: Partial<ToastOptions>) => showToast({ ...opts, message, type: 'error' }), [showToast]),
    warning: useCallback((message: string, opts?: Partial<ToastOptions>) => showToast({ ...opts, message, type: 'warning' }), [showToast]),
    info: useCallback((message: string, opts?: Partial<ToastOptions>) => showToast({ ...opts, message, type: 'info' }), [showToast]),
    otp: useCallback((message: string, otpCode: string) => showToast({ message, type: 'otp', title: `Kode OTP: ${otpCode}`, duration: 15000 }), [showToast]),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, toast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border text-xs flex items-start gap-3 transition-all ${
              t.type === 'success'
                ? 'bg-[#3E4F30] text-[#F5EEDC] border-[#D4A24C]/40'
                : t.type === 'error'
                ? 'bg-[#B4532A] text-white border-white/20'
                : 'bg-[#2B2625] text-[#F5EEDC] border-[#D4A24C]/30'
            }`}
          >
            <div className="flex-1 space-y-1">
              {t.title && <p className="font-bold text-sm">{t.title}</p>}
              <p>{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
