import React, { useState, useEffect } from 'react';
import { Copy, Check, X, ExternalLink, MessageCircle, Globe, Edit3 } from 'lucide-react';

interface ShareWaModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  onSaveVercelUrl?: (url: string) => Promise<void>;
  isAdminUnlocked?: boolean;
}

export const ShareWaModal: React.FC<ShareWaModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  onSaveVercelUrl,
  isAdminUnlocked = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(appUrl);
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [urlSavedOk, setUrlSavedOk] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(appUrl);
      setIsEditingUrl(false);
      setUrlSavedOk(false);
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const targetUrl = appUrl || 'https://pdam-saung-kebun.vercel.app';
  const isVercelLink = targetUrl.includes('vercel.app');

  const waMessage = `💧 *PENDATAAN PEMASANGAN METERAN PDAM*
*PERUMAHAN SAUNG KEBUN*

Assalamu'alaikum Wr. Wb.
Bapak/Ibu warga Perumahan Saung Kebun yang kami hormati,

Untuk rekapitulasi data pemasangan meteran PDAM TIRTA secara transparan dan terpusat (Target 47 Unit), dimohon kesediaannya mengisi status meteran rumah masing-masing melalui tautan resmi berikut:

👉 ${targetUrl}

📱 *Cara Pengisian Sangat Mudah:*
1. Buka tautan di atas melalui browser HP
2. Masukkan Nama Lengkap
3. Pilih Blok dan Nomor Rumah
4. Pilih Status Pemasangan (Sudah Terpasang / Dalam Proses / Belum)
5. Klik "Simpan Data Meteran Warga"

Data langsung tersimpan dan terupdate secara real-time. Terima kasih atas partisipasi dan kerja sama seluruh warga.

_Salam Hangat,_
*Pengurus Warga Perumahan Saung Kebun*`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(waMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const waShareHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveVercelUrl) return;
    try {
      setIsSavingUrl(true);
      await onSaveVercelUrl(urlInput);
      setIsEditingUrl(false);
      setUrlSavedOk(true);
      setTimeout(() => setUrlSavedOk(false), 3000);
    } finally {
      setIsSavingUrl(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight">
                Bagikan Aplikasi ke WhatsApp Warga
              </h4>
              <span className="text-[11px] text-slate-400">
                {isVercelLink
                  ? 'Menggunakan Link Vercel Resmi'
                  : 'Atur Link Vercel agar tautan selalu memakai domain Vercel'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 space-y-4 overflow-y-auto pr-1 text-xs">
          {/* Link Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>Link Web Aplikasi (Vercel):</span>
              </span>
              {onSaveVercelUrl && (isAdminUnlocked || !isVercelLink) && (
                <button
                  type="button"
                  onClick={() => setIsEditingUrl((prev) => !prev)}
                  className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingUrl ? 'Batal' : 'Ubah Link Vercel'}</span>
                </button>
              )}
            </div>

            {isEditingUrl ? (
              <form onSubmit={handleSaveUrl} className="flex items-center gap-2">
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://pdam-saung-kebun.vercel.app"
                  className="w-full px-2.5 py-1.5 bg-white border border-sky-400 rounded-lg text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                />
                <button
                  type="submit"
                  disabled={isSavingUrl}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isSavingUrl ? 'Menyimpan...' : 'Simpan'}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={targetUrl}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 select-all outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold flex items-center gap-1 transition flex-shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
            )}

            {urlSavedOk && (
              <div className="text-[11px] font-semibold text-emerald-700">
                Link Vercel berhasil disimpan &amp; otomatis dipakai untuk semua warga!
              </div>
            )}
          </div>

          {/* Pratinjau Pesan WA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700">Format Pesan Undangan Grup WhatsApp:</span>
              <button
                onClick={handleCopyMessage}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMsg ? 'Pesan Tersalin' : 'Salin Teks Lengkap'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={waMessage}
              rows={9}
              className="w-full p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 font-mono text-[11px] text-slate-700 leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <a
            href={waShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kirim Langsung ke WhatsApp</span>
          </a>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
