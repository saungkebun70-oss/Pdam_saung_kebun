import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  X,
  Copy,
  Check,
  ExternalLink,
  Globe,
  AlertCircle,
  Download,
  Smartphone,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

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
  const [urlSource, setUrlSource] = useState<'public' | 'current'>('public');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const hasDifferentOrigin = Boolean(appUrl && currentOrigin && appUrl !== currentOrigin);

  useEffect(() => {
    if (isOpen) {
      setVercelInput(appUrl);
      setSaveError(null);
      setUrlSource(appUrl ? 'public' : 'current');
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const activeUrl =
    urlSource === 'current' && currentOrigin
      ? currentOrigin
      : appUrl || currentOrigin;

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

  const handleDownloadQrPng = () => {
    const qrCanvas = qrWrapperRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    const padding = 36;
    const headerHeight = 72;
    const footerHeight = 52;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = qrCanvas.width + padding * 2;
    outCanvas.height = qrCanvas.height + padding + headerHeight + footerHeight;

    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // White card background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // Header title
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PDAM SAUNG KEBUN', outCanvas.width / 2, 36);

    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    ctx.fillText('Scan QR Code untuk membuka aplikasi', outCanvas.width / 2, 58);

    // QR image
    ctx.drawImage(qrCanvas, padding, headerHeight);

    // Footer URL
    ctx.fillStyle = '#0f172a';
    ctx.font = '11px monospace';
    const displayUrl = activeUrl.length > 42 ? activeUrl.slice(0, 39) + '...' : activeUrl;
    ctx.fillText(displayUrl, outCanvas.width / 2, headerHeight + qrCanvas.height + 28);

    const pngUrl = outCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'QR_Aplikasi_PDAM_Saung_Kebun.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
            <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
              <QrCode className="w-4 h-4" />
            </div>
            <span>QR Code &amp; Bagikan ke HP / Tablet Lain</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle URL Source when public URL differs from current browser URL */}
        {hasDifferentOrigin && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setUrlSource('public')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                urlSource === 'public'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Link Publik (Vercel)
            </button>
            <button
              type="button"
              onClick={() => setUrlSource('current')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                urlSource === 'current'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Link Browser Ini
            </button>
          </div>
        )}

        {/* QR Code Card */}
        <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 border border-sky-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
          <div
            ref={qrWrapperRef}
            className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <QRCodeCanvas
              value={activeUrl}
              size={200}
              level="M"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-800">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Scan dengan Kamera HP / Tablet Lain</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug max-w-xs">
              Buka Kamera HP atau Google Lens pada perangkat lain, lalu arahkan ke QR Code di atas untuk langsung membuka aplikasi.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadQrPng}
            className="w-full py-2 px-3 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Simpan Gambar QR Code (.PNG)</span>
          </button>
        </div>

        {/* Active URL Copy */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tautan Aplikasi
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activeUrl}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700 outline-none select-all"
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
