import React from 'react';
import {
  BarChart3,
  UserPlus,
  ClipboardList,
  Share2,
  Settings,
} from 'lucide-react';

export type AppPageTab = 'rekap' | 'form' | 'progress' | 'all';

interface MobileBottomNavProps {
  activeTab: AppPageTab;
  onSelectTab: (tab: AppPageTab) => void;
  onOpenShareWa: () => void;
  onOpenPengaturan: () => void;
  recordsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenShareWa,
  onOpenPengaturan,
  recordsCount,
}) => {
  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] px-2 py-1.5"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {/* 1. Rekap Data (1 item per halaman) */}
        <button
          type="button"
          onClick={() => onSelectTab('rekap')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition duration-150 min-w-[56px] relative cursor-pointer ${
            activeTab === 'rekap'
              ? 'text-sky-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition ${
              activeTab === 'rekap' ? 'bg-sky-100 ring-2 ring-sky-300' : ''
            }`}
          >
            <ClipboardList className="w-5 h-5 text-sky-700" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Rekap Data</span>
          {recordsCount > 0 && (
            <span className="absolute -top-0.5 right-1.5 bg-sky-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {recordsCount}
            </span>
          )}
        </button>

        {/* 2. Isi Formulir Data */}
        <button
          type="button"
          onClick={() => onSelectTab('form')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition duration-150 min-w-[56px] cursor-pointer ${
            activeTab === 'form'
              ? 'text-sky-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition ${
              activeTab === 'form' ? 'bg-sky-100 ring-2 ring-sky-300' : ''
            }`}
          >
            <UserPlus className="w-5 h-5 text-sky-700" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Isi Data</span>
        </button>

        {/* 3. Progress Bar / Target 47 */}
        <button
          type="button"
          onClick={() => onSelectTab('progress')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition duration-150 min-w-[56px] cursor-pointer ${
            activeTab === 'progress'
              ? 'text-sky-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition ${
              activeTab === 'progress' ? 'bg-sky-100 ring-2 ring-sky-300' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5 text-sky-700" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Progress</span>
        </button>

        {/* 4. Share WA */}
        <button
          type="button"
          onClick={onOpenShareWa}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-emerald-600 hover:text-emerald-700 transition duration-150 min-w-[56px] cursor-pointer"
        >
          <div className="p-1 rounded-xl hover:bg-emerald-50 transition">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Share WA</span>
        </button>

        {/* 5. Pengaturan Pengurus */}
        <button
          type="button"
          onClick={onOpenPengaturan}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition duration-150 min-w-[56px] cursor-pointer"
        >
          <div className="p-1 rounded-xl hover:bg-slate-100 transition">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Pengurus</span>
        </button>
      </div>
    </nav>
  );
};
