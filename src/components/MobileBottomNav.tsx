import React from 'react';
import { ClipboardList, UserPlus, BarChart3, Share2, Settings } from 'lucide-react';

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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="grid grid-cols-5 items-center px-1 py-1.5">
        <button
          type="button"
          onClick={() => onSelectTab('rekap')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition cursor-pointer relative ${
            activeTab === 'rekap' ? 'text-sky-700 bg-sky-50' : 'text-slate-500'
          }`}
        >
          <ClipboardList className="w-4 h-4 mb-0.5" />
          <span>Rekap</span>
          {recordsCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-sky-600 text-white text-[9px] px-1 rounded-full leading-tight">
              {recordsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('form')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'form' ? 'text-sky-700 bg-sky-50' : 'text-slate-500'
          }`}
        >
          <UserPlus className="w-4 h-4 mb-0.5" />
          <span>Isi Data</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('progress')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'progress' ? 'text-sky-700 bg-sky-50' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>Progress</span>
        </button>

        <button
          type="button"
          onClick={onOpenShareWa}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4 mb-0.5" />
          <span>Share WA</span>
        </button>

        <button
          type="button"
          onClick={onOpenPengaturan}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Atur</span>
        </button>
      </div>
    </nav>
  );
};
