import React, { useState, useEffect } from 'react';
import { Edit2, X, CheckCircle2, Clock, AlertCircle, AlertTriangle, Check } from 'lucide-react';
import { PdamRecord, StatusPemasangan, BlokPilihan } from '../types';

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PdamRecord | null;
  existingRecords: PdamRecord[];
  onSave: (id: string, updated: {
    nama: string;
    blok: string;
    nomor: string;
    status: StatusPemasangan;
    keterangan?: string;
  }) => Promise<void>;
}

const BLOK_OPTIONS: BlokPilihan[] = [
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8',
  'Pos Keamanan',
  'Lainnya',
];

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  onClose,
  record,
  existingRecords,
  onSave,
}) => {
  const [nama, setNama] = useState('');
  const [blok, setBlok] = useState<BlokPilihan>('B1');
  const [customBlok, setCustomBlok] = useState('');
  const [nomor, setNomor] = useState('');
  const [status, setStatus] = useState<StatusPemasangan>('Sudah Terpasang');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (record && isOpen) {
      setNama(String(record.nama || ''));
      const recBlok = String(record.blok || 'B1');
      if (BLOK_OPTIONS.includes(recBlok as BlokPilihan)) {
        setBlok(recBlok as BlokPilihan);
        setCustomBlok('');
      } else {
        setBlok('Lainnya');
        setCustomBlok(recBlok);
      }
      setNomor(String(record.nomor || ''));
      setStatus(record.status || 'Belum Terpasang');
      setKeterangan(String(record.keterangan || ''));
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedNama = nama.trim();
    const finalBlok = (blok === 'Lainnya' ? customBlok.trim() : blok) || 'B1';
    const trimmedNomor = nomor.trim();

    if (!trimmedNama) {
      setErrorMessage('Silakan isi Nama Lengkap Warga.');
      return;
    }

    if (!trimmedNomor) {
      setErrorMessage('Silakan isi Nomor Rumah.');
      return;
    }

    // Check duplicate (ignore self)
    const duplicate = existingRecords.find(
      (r) =>
        r &&
        r.id !== record.id &&
        String(r.blok || '').trim().toLowerCase() === finalBlok.toLowerCase() &&
        String(r.nomor || '').trim().toLowerCase() === trimmedNomor.toLowerCase()
    );

    if (duplicate) {
      setErrorMessage(
        `Unit Blok ${finalBlok} No. ${trimmedNomor} sudah didaftarkan atas nama "${duplicate.nama}". Harap cek kembali nomor rumah.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(record.id, {
        nama: trimmedNama,
        blok: finalBlok,
        nomor: trimmedNomor,
        status,
        keterangan: keterangan.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage('Gagal menyimpan: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
              <Edit2 className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight">
                Edit Data Meteran Warga
              </h4>
              <span className="text-[11px] text-slate-400">
                Kavling {String(record.blok || '')} No. {String(record.nomor || '')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 overflow-y-auto flex-1 pr-1 text-xs">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap Warga <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Pak Sarma"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-150 text-sm outline-none transition"
            />
          </div>

          {/* Blok Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilih Blok Rumah <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {BLOK_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setBlok(opt)}
                  className={`py-1.5 px-1 text-xs font-semibold rounded-lg border transition text-center ${
                    blok === opt
                      ? 'bg-sky-700 text-white border-sky-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {blok === 'Lainnya' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customBlok}
                  onChange={(e) => setCustomBlok(e.target.value)}
                  placeholder="Nama blok / lokasi khusus"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* Nomor Rumah */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nomor Rumah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Contoh: 19 atau 20A"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-150 text-sm outline-none transition"
            />
          </div>

          {/* Status Pemasangan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Status Pemasangan Meteran
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                  status === 'Sudah Terpasang'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="editStatus"
                  value="Sudah Terpasang"
                  checked={status === 'Sudah Terpasang'}
                  onChange={() => setStatus('Sudah Terpasang')}
                  className="hidden"
                />
                <CheckCircle2
                  className={`w-4 h-4 ${
                    status === 'Sudah Terpasang' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span>Sudah Terpasang</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                  status === 'Dalam Proses'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="editStatus"
                  value="Dalam Proses"
                  checked={status === 'Dalam Proses'}
                  onChange={() => setStatus('Dalam Proses')}
                  className="hidden"
                />
                <Clock
                  className={`w-4 h-4 ${
                    status === 'Dalam Proses' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <span>Dalam Proses</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                  status === 'Belum Terpasang'
                    ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="editStatus"
                  value="Belum Terpasang"
                  checked={status === 'Belum Terpasang'}
                  onChange={() => setStatus('Belum Terpasang')}
                  className="hidden"
                />
                <AlertCircle
                  className={`w-4 h-4 ${
                    status === 'Belum Terpasang' ? 'text-rose-600' : 'text-slate-400'
                  }`}
                />
                <span>Belum Terpasang</span>
              </label>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan posisi meteran atau pipa..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 text-xs outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
