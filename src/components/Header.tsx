import React from 'react';
import {
  Droplets,
  Lock,
  Unlock,
  Settings,
  Share2,
  RefreshCw,
} from 'lucide-react';

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
    <header className="bg-gradient-to-r from-sky-800 via-sky-700 to-cyan-700 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-white/15 backdrop-blur-xs rounded-xl border border-white/20 flex-shrink-0">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-tight truncate">
              PDAM Saung Kebun
            </h1>
            <p className="text-[11px] text-sky-100/90 truncate">
              Pendataan Meteran Air • {recordsCount} Unit Terdata
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onRefreshData}
            disabled={isSyncing}
            title="Sinkronkan Data Terbaru"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onOpenShareWa}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan WA</span>
          </button>

          {isAdminUnlocked ? (
            <button
              type="button"
              onClick={onLockAdmin}
              title="Kunci Kembali Mode Pengurus"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-300/40 text-emerald-100 text-xs font-bold transition cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Pengurus Aktif</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPinModal}
              title="Buka Mode Pengurus (PIN)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mode Pengurus</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPengaturan}
            title="Pengaturan Pengurus"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
