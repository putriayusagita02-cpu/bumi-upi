import React, { createContext, useContext, useState, useCallback, useId } from 'react';

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
  duration?: number; // ms, default 5000 (0 for sticky)
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

  const toastHelpers = {
    success: (message: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, message, type: 'success', title: options?.title || 'Berhasil' }),
    error: (message: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, message, type: 'error', title: options?.title || 'Gagal' }),
    warning: (message: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, message, type: 'warning', title: options?.title || 'Perhatian' }),
    info: (message: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, message, type: 'info', title: options?.title || 'Informasi' }),
    otp: (message: string, otpCode: string, onAutoFill?: () => void) =>
      showToast({
        type: 'otp',
        title: '💬 WhatsApp OTP Demo',
        message: `${message}: ${otpCode}`,
        duration: 10000,
        action: onAutoFill
          ? {
              label: 'Isi Otomatis',
              onClick: onAutoFill,
            }
          : undefined,
      }),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        toast: toastHelpers,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItemCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItemCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const typeConfigs: Record<
    ToastType,
    { bg: string; border: string; text: string; icon: React.ReactNode }
  > = {
    success: {
      bg: '#F4F6F2',
      border: '#3E4F30',
      text: '#2A3620',
      icon: (
        <svg className="w-5 h-5 text-[#3E4F30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: '#FDF4F0',
      border: '#B4532A',
      text: '#93401E',
      icon: (
        <svg className="w-5 h-5 text-[#B4532A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bg: '#FDF7EE',
      border: '#D4A24C',
      text: '#946618',
      icon: (
        <svg className="w-5 h-5 text-[#D4A24C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bg: '#F5EEDC',
      border: '#C7D4BF',
      text: '#2B2625',
      icon: (
        <svg className="w-5 h-5 text-[#3E4F30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    otp: {
      bg: '#FBF7EE',
      border: '#B4532A',
      text: '#2B2625',
      icon: (
        <span className="text-lg">💬</span>
      ),
    },
  };

  const config = (toast.type && toast.type in typeConfigs) ? typeConfigs[toast.type] : typeConfigs.info;

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 p-4 rounded-[1rem] border shadow-lg transition-all transform duration-200"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        boxShadow: '0 8px 24px -4px rgba(59, 42, 30, 0.15)',
      }}
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B2625] mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-sm font-medium" style={{ color: config.text }}>
          {toast.message}
        </p>

        {toast.action && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-md text-white transition-opacity hover:opacity-90 active:scale-95 shadow-xs"
              style={{ backgroundColor: '#B4532A' }}
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="shrink-0 text-[#634E3F] hover:text-[#2B2625] p-1 rounded-full transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
