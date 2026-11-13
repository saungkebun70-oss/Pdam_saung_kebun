import React, { useState, useEffect } from 'react';
import { Share2, X, Copy, Check, ExternalLink, Globe, AlertCircle } from 'lucide-react';

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
  isAdminUnlocked,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [vercelInput, setVercelInput] = useState(appUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVercelInput(appUrl);
      setSaveError(null);
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const activeUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const shareMessage = `Assalamu'alaikum Bapak/Ibu Warga Perumahan Saung Kebun,\n\nSilakan isi & cek data pemasangan meteran air PDAM serta unggah foto bukti meteran sesuai Blok & No. Rumah melalui tautan berikut:\n${activeUrl}\n\nTerima kasih.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveVercelUrl || !vercelInput.trim()) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await onSaveVercelUrl(vercelInput.trim());
    } catch (err: any) {
      setSaveError(err?.message || 'Gagal menyimpan link.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Share2 className="w-5 h-5" />
            <span>Bagikan Link Aplikasi ke Grup WA</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tautan Aplikasi Aktif
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activeUrl}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {isAdminUnlocked && onSaveVercelUrl && (
          <form onSubmit={handleSaveUrl} className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Atur Link Publik (Vercel / Domain)</span>
            </div>
            {saveError && (
              <div className="text-[11px] text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{saveError}</span>
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={vercelInput}
                onChange={(e) => setVercelInput(e.target.value)}
                placeholder="https://pdam-saung-kebun.vercel.app"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white text-xs outline-none"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? '...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kirim ke WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
