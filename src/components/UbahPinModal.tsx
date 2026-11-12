import React, { useState } from 'react';
import { KeyRound, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UbahPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSavedPin: string;
  onPinUpdated: (newPin: string) => Promise<void>;
}

export const UbahPinModal: React.FC<UbahPinModalProps> = ({
  isOpen,
  onClose,
  currentSavedPin,
  onPinUpdated,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (oldPin !== currentSavedPin) {
      setError('PIN lama tidak sesuai! Masukkan PIN pengurus yang saat ini aktif.');
      return;
    }

    if (!/^[0-9]{6}$/.test(newPin)) {
      setError('PIN baru harus tepat 6 angka (0-9).');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Konfirmasi PIN baru tidak sama dengan PIN baru.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onPinUpdated(newPin);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError('Gagal memperbarui PIN: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-150">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-100 text-cyan-800 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight">
                Ubah PIN Pengurus
              </h4>
              <span className="text-[11px] text-slate-400">Tersimpan ke Dokumen Settings</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Ganti PIN 6 angka pengurus untuk mengamankan fitur hapus dan reset data warga.
        </p>

        {error && (
          <div className="p-2.5 mb-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isDone && (
          <div className="p-3 mb-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>PIN Pengurus Berhasil Diperbarui di Cloud Firestore!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              PIN Lama (Saat Ini)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 123456"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-200 text-sm font-semibold tracking-widest text-center outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              PIN Baru (6 Angka)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Masukkan 6 angka baru"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-200 text-sm font-semibold tracking-widest text-center outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Konfirmasi PIN Baru
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Ketik ulang 6 angka baru"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-200 text-sm font-semibold tracking-widest text-center outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || newPin.length !== 6 || confirmPin.length !== 6}
              className="flex-1 py-2 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan PIN Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
