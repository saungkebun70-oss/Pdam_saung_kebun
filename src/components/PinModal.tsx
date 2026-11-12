import React, { useState, useRef, useEffect } from 'react';
import { Lock, X, AlertCircle, CheckCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  title?: string;
  description?: string;
  actionButtonText?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  title = 'Verifikasi PIN Pengurus',
  description = 'Masukkan 6 angka PIN pengurus untuk melanjutkan tindakan ini.',
  actionButtonText = 'Konfirmasi PIN',
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError(null);
      setIsSuccess(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    setError(null);
    const sanitized = val.replace(/\D/g, '');

    if (!sanitized) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // Single digit entry
    const char = sanitized[sanitized.length - 1];
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    // Auto advance
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // Completed all 6 digits
      const entered = next.join('');
      validatePin(entered);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      next[i] = pasteData[i];
    }
    setDigits(next);

    if (pasteData.length === 6) {
      validatePin(pasteData);
    } else {
      inputRefs.current[Math.min(5, pasteData.length)]?.focus();
    }
  };

  const validatePin = (pinToTest: string) => {
    if (pinToTest === correctPin) {
      setIsSuccess(true);
      setError(null);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 300);
    } else {
      setError('PIN salah! Silakan coba lagi (PIN default awal pengurus: 123456)');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = digits.join('');
    if (entered.length < 6) {
      setError('Harap masukkan lengkap 6 angka PIN pengurus.');
      return;
    }
    validatePin(entered);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-150 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight">{title}</h4>
              <span className="text-[11px] text-slate-400">Keamanan Akses Data</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">{description}</p>

        <form onSubmit={handleManualSubmit}>
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-between gap-2 mb-4" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 h-12 text-center text-xl font-bold rounded-xl border transition outline-none ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 text-rose-700 focus:ring-2 focus:ring-rose-200'
                    : isSuccess
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 text-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Feedback message */}
          {error && (
            <div className="p-2.5 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-2.5 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>PIN Cocok! Membuka akses...</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={digits.join('').length < 6}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {actionButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
