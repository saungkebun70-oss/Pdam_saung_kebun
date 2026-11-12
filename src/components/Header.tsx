import React from 'react';
import { Droplets, ShieldCheck, Lock, RefreshCw, Share2, Settings } from 'lucide-react';

interface HeaderProps {
  isAdminUnlocked: boolean;
  onOpenPinModal: () => void;
  onLockAdmin: () => void;
  onOpenPengaturan: () => void;
  onOpenShareWa: () => void;
  onRefreshData: () => void;
  isSyncing: boolean;
  recordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminUnlocked,
  onOpenPinModal,
  onLockAdmin,
  onOpenPengaturan,
  onOpenShareWa,
  onRefreshData,
  isSyncing,
  recordsCount,
}) => {
  return (
    <header className="bg-gradient-to-r from-sky-800 via-cyan-800 to-teal-800 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0 bg-white/15 backdrop-blur-sm p-2.5 rounded-2xl border border-white/20 shadow-inner">
              <Droplets className="w-7 h-7 text-cyan-200 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sky-900 animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sky-900" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-cyan-500/30 text-cyan-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-cyan-400/30 tracking-wide">
                  PDAM TIRTA
                </span>
                <span className="text-xs text-sky-200 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Cloud Real-time ({recordsCount} terdata)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                Pendataan Pemasangan PDAM – Perumahan Saung Kebun
              </h1>
              <p className="text-xs text-sky-100 hidden sm:block">
                Pendataan meteran air terpusat &amp; transparan untuk 47 unit rumah
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {/* Quick Share to WA button */}
            <button
              onClick={onOpenShareWa}
              title="Bagikan Tautan Aplikasi ke WhatsApp Warga"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition border border-emerald-400/50 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share ke WA</span>
            </button>

            {/* Pengaturan Button */}
            <button
              onClick={onOpenPengaturan}
              title="Pengaturan Pengurus & Ganti PIN"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-sky-100 bg-white/10 hover:bg-white/20 rounded-xl transition border border-white/15 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-200" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>

            {/* Sync refresh button */}
            <button
              onClick={onRefreshData}
              title="Sinkronisasi Data Ulang"
              aria-label="Refresh Data"
              className="p-1.5 text-sky-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition duration-150 border border-white/10 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-300' : ''}`} />
            </button>

            {/* Mode Pengurus Toggle */}
            {isAdminUnlocked ? (
              <div key="admin-unlocked" className="flex items-center gap-1.5 bg-emerald-500/25 border border-emerald-400/40 rounded-xl p-1 pl-2.5">
                <div className="flex items-center gap-1 text-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span className="hidden xs:inline">Pengurus</span>
                </div>
                <button
                  onClick={onLockAdmin}
                  title="Kunci Kembali Mode Pengurus"
                  className="px-2 py-0.5 text-xs bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-medium cursor-pointer"
                >
                  Kunci
                </button>
              </div>
            ) : (
              <button
                key="admin-locked"
                onClick={onOpenPinModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-amber-500/90 hover:bg-amber-500 rounded-xl shadow-sm transition border border-amber-400/50 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mode Pengurus</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
