import React, { useState } from 'react';
import { Share2, Copy, Check, X, MessageSquare, ExternalLink, Download } from 'lucide-react';
import { PdamRecord, TARGET_TOTAL_UNIT } from '../types';

interface ExportWaModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PdamRecord[];
}

export const ExportWaModal: React.FC<ExportWaModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate WA Format 1 - 47
  const terpasangCount = records.filter((r) => r.status === 'Sudah Terpasang').length;
  const prosesCount = records.filter((r) => r.status === 'Dalam Proses').length;
  const belumCount = records.filter((r) => r.status === 'Belum Terpasang').length;
  const percent = Math.min(100, Math.round((terpasangCount / TARGET_TOTAL_UNIT) * 100));

  const nowStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [];
  lines.push(`*LAPORAN PEMASANGAN METERAN PDAM*`);
  lines.push(`*PERUMAHAN SAUNG KEBUN*`);
  lines.push(`📅 _Update: ${nowStr}_`);
  lines.push(``);
  lines.push(`📊 *Ringkasan Realisasi:*`);
  lines.push(`• Sudah Terpasang: *${terpasangCount}* / ${TARGET_TOTAL_UNIT} Unit (*${percent}%*)`);
  lines.push(`• Dalam Proses    : *${prosesCount}* Unit`);
  lines.push(`• Belum Terpasang : *${belumCount}* Unit`);
  lines.push(`-------------------------------------------`);
  lines.push(`*DAFTAR UNIT (1 - ${TARGET_TOTAL_UNIT}):*`);

  for (let i = 1; i <= TARGET_TOTAL_UNIT; i++) {
    const recordIndex = i - 1;
    if (recordIndex < records.length) {
      const rec = records[recordIndex];
      lines.push(
        `${i}. Nama: ${rec.nama} | Blok/No: ${rec.blok}/${rec.nomor} | Status: ${rec.status}`
      );
    } else {
      // Empty template as specified in user prompt:
      // "5. Nama:  | Blok/No:  | Status: Sudah Terpasang"
      lines.push(`${i}. Nama:  | Blok/No:  | Status: Sudah Terpasang`);
    }
  }

  lines.push(`-------------------------------------------`);
  lines.push(`_Catatan: Data tersinkronisasi otomatis via Cloud Firestore Saung Kebun._`);

  const fullText = lines.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWa = () => {
    const encoded = encodeURIComponent(fullText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_PDAM_Saung_Kebun_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight">
                Salin Format WhatsApp (1–47)
              </h4>
              <span className="text-[11px] text-slate-400">Siap Kirim ke Grup Paguyuban Warga</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="my-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Pratinjau Teks WhatsApp (Lengkap 1 s/d 47):</span>
            <span className="font-semibold text-emerald-600">
              {records.length} terisi • {Math.max(0, TARGET_TOTAL_UNIT - records.length)} slot template
            </span>
          </div>

          <textarea
            readOnly
            value={fullText}
            className="w-full h-64 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Berhasil Disalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Format WA (1–47)</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWa}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            title="Buka Langsung di WhatsApp Web/App"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Kirim WA</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            title="Download sebagai file .txt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
