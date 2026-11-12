import React, { useState } from 'react';
import { Share2, Copy, Check, X, ExternalLink, Smartphone, MessageCircle } from 'lucide-react';

interface ShareWaModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const ShareWaModal: React.FC<ShareWaModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen) return null;

  const targetUrl = appUrl || window.location.href;

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
*Pengurus Paguyuban Warga Saung Kebun*`;

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

  const handleDirectShareWa = () => {
    const encoded = encodeURIComponent(waMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
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
                Aplikasi Sudah Aktif di Cloud (Tinggal Sebar Link di Grup WA)
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

        {/* Content */}
        <div className="my-4 space-y-4 overflow-y-auto pr-1 text-xs">
          {/* Link Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="font-bold text-slate-700 block">Link Aplikasi Web (Siap Akses):</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={targetUrl}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 select-all outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold flex items-center gap-1 transition flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>
          </div>

          {/* Pratinjau Pesan WA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700">Format Pesan Undangan Grup WhatsApp:</span>
              <button
                onClick={handleCopyMessage}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
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
          <button
            onClick={handleDirectShareWa}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kirim Langsung ke WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
