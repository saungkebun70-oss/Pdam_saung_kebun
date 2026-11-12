import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Home, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TARGET_TOTAL_UNIT, PdamRecord } from '../types';

interface ProgressBarProps {
  records: PdamRecord[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ records }) => {
  const terpasangCount = records.filter((r) => r.status === 'Sudah Terpasang').length;
  const prosesCount = records.filter((r) => r.status === 'Dalam Proses').length;
  const belumCount = records.filter((r) => r.status === 'Belum Terpasang').length;
  const totalTerdata = records.length;

  const percentage = Math.min(100, Math.round((terpasangCount / TARGET_TOTAL_UNIT) * 100));
  const sisaTarget = Math.max(0, TARGET_TOTAL_UNIT - terpasangCount);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#06b6d4', '#10b981', '#f59e0b'],
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-150 transition-all">
      {/* Top Banner Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-150">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              Target Komunitas
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Kavling Saung Kebun
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2">
            <span>{terpasangCount}</span>
            <span className="text-slate-400 font-normal text-lg">/ {TARGET_TOTAL_UNIT} Unit Terpasang</span>
            {percentage === 100 && (
              <span className="text-emerald-700 bg-emerald-50 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-500" /> Target Tercapai!
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600">
              {percentage}%
            </div>
            <div className="text-xs text-slate-400 font-medium">Realisasi Pemasangan</div>
          </div>
          {percentage > 0 && (
            <button
              onClick={triggerCelebration}
              title="Rayakan Kemajuan Pemasangan!"
              className="p-2.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Progress Bar Container */}
      <div className="space-y-1.5 mb-5">
        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
          <span>0 Unit</span>
          <span>12 Unit (25%)</span>
          <span>24 Unit (50%)</span>
          <span>35 Unit (75%)</span>
          <span className="text-slate-600 font-bold">47 Unit (100%)</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Sudah Terpasang */}
        <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-900 leading-tight">
              {terpasangCount}
            </div>
            <div className="text-xs font-medium text-emerald-700">Sudah Terpasang</div>
            <div className="text-[10px] text-emerald-600 font-medium">Meteran Aktif</div>
          </div>
        </div>

        {/* Dalam Proses */}
        <div className="bg-amber-50/70 border border-amber-150 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-amber-900 leading-tight">
              {prosesCount}
            </div>
            <div className="text-xs font-medium text-amber-700">Dalam Proses</div>
            <div className="text-[10px] text-amber-600 font-medium">Antrean Pasang</div>
          </div>
        </div>

        {/* Belum Terpasang */}
        <div className="bg-rose-50/70 border border-rose-150 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-2 bg-rose-500 text-white rounded-lg shadow-sm">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-rose-900 leading-tight">
              {belumCount}
            </div>
            <div className="text-xs font-medium text-rose-700">Belum Pasang</div>
            <div className="text-[10px] text-rose-600 font-medium">Tahap Sosialisasi</div>
          </div>
        </div>

        {/* Sisa Target Kuota */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-2 bg-slate-700 text-white rounded-lg shadow-sm">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800 leading-tight">
              {sisaTarget}
            </div>
            <div className="text-xs font-medium text-slate-600">Sisa Kuota</div>
            <div className="text-[10px] text-slate-500 font-medium">Total: {totalTerdata} terdaftar</div>
          </div>
        </div>
      </div>
    </div>
  );
};
