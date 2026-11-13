import React, { useState, useEffect } from 'react';
import { Settings, KeyRound, Share2, Database, X, CheckCircle, AlertCircle, Copy, Check, ExternalLink, RefreshCw, FileSpreadsheet, Download, Globe } from 'lucide-react';

interface PengaturanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onUpdatePin: (newPin: string) => Promise<void>;
  onRequestReset: () => void;
  onExportCsv: () => void;
  onExportTxt: () => void;
  appUrl: string;
  onSaveVercelUrl?: (url: string) => Promise<void>;
}

export const PengaturanModal: React.FC<PengaturanModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onUpdatePin,
  onRequestReset,
  onExportCsv,
  onExportTxt,
  appUrl,
  onSaveVercelUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'pin' | 'share' | 'db'>('pin');

  // PIN Form State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  // Share State
  const [copiedLink, setCopiedLink] = useState(false);
  const [vercelInput, setVercelInput] = useState(appUrl);
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [urlSavedSuccess, setUrlSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVercelInput(appUrl);
      setUrlSavedSuccess(false);
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const targetUrl = appUrl || window.location.href;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (oldPin !== currentPin) {
      setPinError('PIN saat ini tidak cocok! Masukkan PIN pengurus yang aktif.');
      return;
    }

    if (!/^[0-9]{6}$/.test(newPin)) {
      setPinError('PIN baru wajib tepat 6 angka (0-9).');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    try {
      setIsSubmittingPin(true);
      await onUpdatePin(newPin);
      setPinSuccess(true);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setPinSuccess(false);
      }, 3500);
    } catch (err: any) {
      setPinError('Gagal mengubah PIN: ' + (err.message || 'Coba lagi'));
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWa = () => {
    const text = `💧 *PENDATAAN PEMASANGAN METERAN PDAM PERUMAHAN SAUNG KEBUN*\n\nBapak/Ibu warga Saung Kebun, silakan mengisi status meteran rumah masing-masing melalui tautan berikut:\n👉 ${targetUrl}\n\nTerima kasih.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-xl">
              <Settings className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight">
                Pengaturan Pengurus
              </h4>
              <span className="text-[11px] text-slate-400">
                Ganti PIN, Bagikan Link WA &amp; Database
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

        {/* Tab Navigation */}
        <div className="flex gap-1.5 border-b border-slate-200 pt-3 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pin')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'pin'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ganti PIN</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'share'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan ke WA</span>
          </button>

          <button
            onClick={() => setActiveTab('db')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'db'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="py-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: GANTI PIN */}
          {activeTab === 'pin' && (
            <div>
              <p className="text-slate-500 mb-3 leading-relaxed">
                Ubah 6 angka PIN pengurus untuk mengamankan fitur hapus data dan reset rekapitulasi. Tersimpan langsung ke database cloud Firestore.
              </p>

              {pinError && (
                <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {pinSuccess && (
                <div className="p-2.5 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>PIN Pengurus Berhasil Diperbarui di Cloud Firestore!</span>
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PIN Saat Ini
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN aktif (default: 123456)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-center text-sm font-semibold tracking-widest outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PIN Baru (6 Angka)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ketik 6 angka baru"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-center text-sm font-semibold tracking-widest outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ulangi PIN Baru
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Konfirmasi 6 angka baru"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-center text-sm font-semibold tracking-widest outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPin || newPin.length !== 6 || confirmPin.length !== 6}
                  className="w-full py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50 mt-1 cursor-pointer"
                >
                  {isSubmittingPin ? 'Menyimpan ke Cloud...' : 'Simpan PIN Baru'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: BAGIKAN KE WA (LINK VERCEL) */}
          {activeTab === 'share' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                <span className="font-bold block">Link Web dari Vercel</span>
                <p className="text-[11px] text-emerald-800">
                  Link web diambil otomatis saat aplikasi dibuka dari domain Vercel, atau Anda dapat menempelkan link Vercel Anda di bawah ini agar tersimpan untuk semua warga.
                </p>
              </div>

              {onSaveVercelUrl && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSavingUrl(true);
                    try {
                      await onSaveVercelUrl(vercelInput);
                      setUrlSavedSuccess(true);
                      setTimeout(() => setUrlSavedSuccess(false), 3000);
                    } finally {
                      setIsSavingUrl(false);
                    }
                  }}
                  className="space-y-1.5"
                >
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-sky-600" />
                    <span>Atur Link Vercel Resmi</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={vercelInput}
                      onChange={(e) => setVercelInput(e.target.value)}
                      placeholder="https://nama-project.vercel.app"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 focus:border-sky-500 rounded-lg text-xs font-mono text-slate-800 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSavingUrl}
                      className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-bold transition flex-shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingUrl ? 'Simpan...' : 'Simpan'}
                    </button>
                  </div>
                  {urlSavedSuccess && (
                    <div className="text-[11px] font-semibold text-emerald-700">
                      Link Vercel berhasil disimpan ke Cloud Firestore!
                    </div>
                  )}
                </form>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tautan Aplikasi Aktif (Untuk Dibagikan)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold flex items-center gap-1 transition flex-shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShareWa}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka &amp; Bagikan ke WhatsApp Warga</span>
              </button>
            </div>
          )}

          {/* TAB 3: DATABASE, DOWNLOAD REKAPAN & RESET */}
          {activeTab === 'db' && (
            <div className="space-y-3">
              {/* Download Data Hasil Rekapan */}
              <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl space-y-2">
                <span className="font-bold text-sky-900 block">
                  Download Data Hasil Rekapan:
                </span>
                <p className="text-[11px] text-sky-800">
                  Unduh seluruh data rekapitulasi pemasangan meteran PDAM warga ke perangkat Anda.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={onExportCsv}
                    className="py-2 px-3 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel / CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={onExportTxt}
                    className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Laporan .TXT</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-800 block">Koleksi Firestore:</span>
                <div className="font-mono text-[11px] text-slate-600 space-y-0.5">
                  <div>• pdam_saung_kebun (Data Meteran)</div>
                  <div>• settings/admin (PIN Pengurus)</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-150">
                <span className="font-bold text-slate-800 block mb-1">Reset Data Database:</span>
                <p className="text-slate-500 mb-2">
                  Jika ingin mengembalikan database menjadi 46 data master warga lunas (Blok B3, B5, B6, B7, B8):
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestReset();
                  }}
                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold rounded-xl transition text-center flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Database ke 46 Data Master (Verifikasi PIN)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
