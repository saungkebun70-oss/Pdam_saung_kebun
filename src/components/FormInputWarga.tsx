import React, { useState } from 'react';
import { UserPlus, CheckCircle2, Clock, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { BlokPilihan, StatusPemasangan, PdamRecord } from '../types';

interface FormInputWargaProps {
  existingRecords: PdamRecord[];
  onSubmit: (data: {
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

export const FormInputWarga: React.FC<FormInputWargaProps> = ({
  existingRecords,
  onSubmit,
}) => {
  const [nama, setNama] = useState('');
  const [blok, setBlok] = useState<BlokPilihan>('B1');
  const [customBlok, setCustomBlok] = useState('');
  const [nomor, setNomor] = useState('');
  const [status, setStatus] = useState<StatusPemasangan>('Sudah Terpasang');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedBlokName = blok === 'Lainnya' ? customBlok.trim() || 'Lainnya' : blok;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedNama = nama.trim();
    const finalBlok = blok === 'Lainnya' ? customBlok.trim() : blok;
    const trimmedNomor = nomor.trim();

    // 1. Basic validation
    if (!trimmedNama) {
      setErrorMessage('Silakan isi Nama Lengkap Warga terlebih dahulu.');
      return;
    }

    if (!finalBlok) {
      setErrorMessage('Silakan pilih atau isi nama Blok rumah.');
      return;
    }

    if (!trimmedNomor) {
      setErrorMessage('Silakan isi Nomor Rumah warga (contoh: 19, 05, atau 12A).');
      return;
    }

    // 2. Duplicate Validation (Case-insensitive & clean spaces)
    const duplicate = existingRecords.find(
      (r) =>
        r &&
        String(r.blok || '').trim().toLowerCase() === finalBlok.toLowerCase() &&
        String(r.nomor || '').trim().toLowerCase() === trimmedNomor.toLowerCase()
    );

    if (duplicate) {
      setErrorMessage(
        `Duplikasi Terdeteksi! Unit Blok ${finalBlok} No. ${trimmedNomor} sudah pernah didaftarkan atas nama "${duplicate.nama}" dengan status "${duplicate.status}". Jika ingin memperbarui, gunakan tombol edit di tabel rekapitulasi.`
      );
      return;
    }

    // 3. Save to database
    try {
      setIsSubmitting(true);
      await onSubmit({
        nama: trimmedNama,
        blok: finalBlok,
        nomor: trimmedNomor,
        status,
        keterangan: keterangan.trim(),
      });

      setSuccessMessage(
        `Alhamdulillah! Data pemasangan warga ${trimmedNama} (Blok ${finalBlok} No. ${trimmedNomor}) berhasil tersimpan ke database.`
      );

      // Reset form
      setNama('');
      setNomor('');
      setKeterangan('');
      if (blok === 'Lainnya') setCustomBlok('');

      // Auto dismiss success toast after 6s
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat menyimpan ke database: ' + (err.message || 'Coba lagi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-150">
      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
        <div className="p-2 bg-gradient-to-tr from-sky-600 to-cyan-500 text-white rounded-xl shadow-sm">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            Formulir Pemasangan PDAM Warga
          </h3>
          <p className="text-xs text-slate-500">
            Isi formulir ini langsung dari HP untuk mencatat pemasangan meteran air rumah
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Peringatan Validasi:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Berhasil Tersimpan!</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Warga */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Lengkap Warga <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Pak Sarma / Bu Dwi"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-sm outline-none transition"
          />
        </div>

        {/* Pilihan Blok */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Pilih Blok Rumah <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {BLOK_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setBlok(opt)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition text-center ${
                  blok === opt
                    ? 'bg-sky-700 text-white border-sky-800 shadow-sm'
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
                placeholder="Sebutkan lokasi (contoh: Musholla / Fasum)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-xs outline-none"
              />
            </div>
          )}
        </div>

        {/* Nomor Rumah */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nomor Rumah <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            placeholder="Contoh: 19 atau 23A"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-sm outline-none transition"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Kombinasi Blok ({selectedBlokName}) dan Nomor Rumah ({nomor || '...'}) harus unik.
          </p>
        </div>

        {/* Status Pemasangan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Status Pemasangan Meteran <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Sudah Terpasang */}
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                status === 'Sudah Terpasang'
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-200 text-emerald-950'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="Sudah Terpasang"
                checked={status === 'Sudah Terpasang'}
                onChange={() => setStatus('Sudah Terpasang')}
                className="hidden"
              />
              <CheckCircle2
                className={`w-5 h-5 ${
                  status === 'Sudah Terpasang' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold">Sudah Terpasang</div>
                <div className="text-[10px] text-slate-500">Air mengalir &amp; meteran aktif</div>
              </div>
            </label>

            {/* Dalam Proses */}
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                status === 'Dalam Proses'
                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-200 text-amber-950'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="Dalam Proses"
                checked={status === 'Dalam Proses'}
                onChange={() => setStatus('Dalam Proses')}
                className="hidden"
              />
              <Clock
                className={`w-5 h-5 ${
                  status === 'Dalam Proses' ? 'text-amber-600' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold">Dalam Proses</div>
                <div className="text-[10px] text-slate-500">Antrean teknisi / pipa terpasang</div>
              </div>
            </label>

            {/* Belum Terpasang */}
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                status === 'Belum Terpasang'
                  ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-200 text-rose-950'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="Belum Terpasang"
                checked={status === 'Belum Terpasang'}
                onChange={() => setStatus('Belum Terpasang')}
                className="hidden"
              />
              <AlertCircle
                className={`w-5 h-5 ${
                  status === 'Belum Terpasang' ? 'text-rose-600' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold">Belum Terpasang</div>
                <div className="text-[10px] text-slate-500">Menunggu pendaftaran / biaya</div>
              </div>
            </label>
          </div>
        </div>

        {/* Catatan / Keterangan Tambahan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Meteran posisi depan pagar, pipa sudah siap"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-xs outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan ke Cloud Firestore...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Data Meteran Warga</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
