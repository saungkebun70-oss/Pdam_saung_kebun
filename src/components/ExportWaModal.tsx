import React, { useState, useMemo } from 'react';
import { MessageCircle, X, Copy, Check, ExternalLink } from 'lucide-react';
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

  const waText = useMemo(() => {
    const terpasangCount = records.filter((r) => r.status === 'Sudah Terpasang').length;
    const prosesCount = records.filter((r) => r.status === 'Dalam Proses').length;
    const belumCount = records.filter((r) => r.status === 'Belum Terpasang').length;
    const percent = Math.min(100, Math.round((terpasangCount / TARGET_TOTAL_UNIT) * 100));

    const lines: string[] = [
      '*REKAP DATA PEMASANGAN PDAM TIRTA*',
      '*PERUMAHAN SAUNG KEBUN*',
      `Update: ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
      '',
      `📊 *Ringkasan (Target ${TARGET_TOTAL_UNIT} Unit):*`,
      `✅ Sudah Terpasang: ${terpasangCount} unit (${percent}%)`,
      `⏳ Dalam Proses: ${prosesCount} unit`,
      `❌ Belum Terpasang: ${belumCount} unit`,
      `📋 Total Terdata: ${records.length} unit`,
      '',
      '*Daftar Warga (1 s.d. 47):*',
    ];

    for (let i = 0; i < TARGET_TOTAL_UNIT; i++) {
      const rec = records[i];
      if (rec) {
        const icon =
          rec.status === 'Sudah Terpasang'
            ? '✅'
            : rec.status === 'Dalam Proses'
            ? '⏳'
            : '❌';
        const fotoTag = rec.fotoBukti ? ' 📷' : '';
        const ket = rec.keterangan ? ` (${rec.keterangan})` : '';
        lines.push(`${i + 1}. ${rec.nama} - Blok ${rec.blok}/${rec.nomor} ${icon}${fotoTag}${ket}`);
      } else {
        lines.push(`${i + 1}. ___________________________`);
      }
    }

    return lines.join('\n');
  }, [records]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(waText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <MessageCircle className="w-5 h-5" />
            <span>Format Laporan WhatsApp (1–47)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <p className="text-xs text-slate-500">
            Salin teks di bawah ini atau langsung kirim ke grup WhatsApp warga Saung Kebun:
          </p>
          <textarea
            readOnly
            value={waText}
            rows={14}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700 outline-none resize-none"
          />
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Teks WA</span>
              </>
            )}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kirim via WA</span>
          </a>
        </div>
      </div>
    </div>
  );
};
