import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Camera, Target } from 'lucide-react';
import { PdamRecord, TARGET_TOTAL_UNIT } from '../types';

interface ProgressBarProps {
  records: PdamRecord[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ records }) => {
  const terpasangCount = records.filter((r) => r.status === 'Sudah Terpasang').length;
  const prosesCount = records.filter((r) => r.status === 'Dalam Proses').length;
  const belumCount = records.filter((r) => r.status === 'Belum Terpasang').length;
  const fotoCount = records.filter((r) => Boolean(r.fotoBukti)).length;

  const percentage = Math.min(100, Math.round((terpasangCount / TARGET_TOTAL_UNIT) * 100));
  const sisaTarget = Math.max(0, TARGET_TOTAL_UNIT - terpasangCount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Progress Realisasi Target {TARGET_TOTAL_UNIT} Unit PDAM
            </h2>
            <p className="text-xs text-slate-500">
              {terpasangCount} dari {TARGET_TOTAL_UNIT} rumah sudah terpasang meteran air
              {sisaTarget > 0 ? ` (sisa ${sisaTarget} unit lagi)` : ' — Target Tercapai!'}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-2xl font-black text-sky-700">{percentage}%</span>
          <span className="text-[11px] font-semibold text-slate-400 block">Terpasang</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200/80">
        <div
          className="h-full bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terpasang</span>
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1">{terpasangCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80">
          <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Dalam Proses</span>
          </div>
          <div className="text-xl font-black text-amber-900 mt-1">{prosesCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80">
          <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Belum Pasang</span>
          </div>
          <div className="text-xl font-black text-rose-900 mt-1">{belumCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200/80">
          <div className="flex items-center gap-1.5 text-sky-700 text-xs font-bold">
            <Camera className="w-3.5 h-3.5" />
            <span>Bukti Foto</span>
          </div>
          <div className="text-xl font-black text-sky-900 mt-1">
            {fotoCount}
            <span className="text-xs font-semibold text-sky-600 ml-1">/ {records.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
