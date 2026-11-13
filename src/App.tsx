/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  subscribePdamRecords,
  subscribeAdminSettings,
  addPdamRecord,
  updatePdamStatus,
  updatePdamRecord,
  deletePdamRecord,
  updateAdminPin,
  updateVercelUrl,
  resetDatabaseToDefault,
  checkAndSeedInitialData,
} from './services/firebase';
import { PdamRecord, StatusPemasangan, DEFAULT_ADMIN_PIN, TARGET_TOTAL_UNIT } from './types';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { FormInputWarga } from './components/FormInputWarga';
import { TabelRekapitulasi } from './components/TabelRekapitulasi';
import { PinModal } from './components/PinModal';
import { ExportWaModal } from './components/ExportWaModal';
import { PengaturanModal } from './components/PengaturanModal';
import { ShareWaModal } from './components/ShareWaModal';
import { MobileBottomNav, AppPageTab } from './components/MobileBottomNav';
import { exportToCsv, exportToTxt } from './utils/exportCsv';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  ClipboardList,
  UserPlus,
  BarChart3,
  Layers,
  Download,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<PdamRecord[]>([]);
  const [adminPin, setAdminPin] = useState<string>(DEFAULT_ADMIN_PIN);
  const [vercelUrl, setVercelUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('pdam_vercel_url') || '';
    } catch {
      return '';
    }
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<AppPageTab>('rekap');

  // Modals state
  const [pinModalConfig, setPinModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionButtonText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionButtonText: '',
    onConfirm: () => {},
  });

  const [isExportWaOpen, setIsExportWaOpen] = useState(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(false);
  const [isShareWaOpen, setIsShareWaOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Real-time Firestore Subscriptions
  useEffect(() => {
    setIsLoading(true);

    const unsubscribeRecords = subscribePdamRecords(
      (data) => {
        setRecords(data);
        setIsLoading(false);
        setIsSyncing(false);
      },
      (err) => {
        console.error('Records subscription error:', err);
        setIsLoading(false);
        setIsSyncing(false);
      }
    );

    const unsubscribeSettings = subscribeAdminSettings(
      (settings) => {
        setAdminPin(settings.pin);
        if (settings.vercelUrl) {
          setVercelUrl(settings.vercelUrl);
          try {
            localStorage.setItem('pdam_vercel_url', settings.vercelUrl);
          } catch {
            // Ignore storage errors
          }
        } else if (
          typeof window !== 'undefined' &&
          window.location.hostname.endsWith('.vercel.app')
        ) {
          const origin = window.location.origin;
          setVercelUrl(origin);
          try {
            localStorage.setItem('pdam_vercel_url', origin);
          } catch {
            // Ignore storage errors
          }
          updateVercelUrl(origin, settings.pin).catch((e) =>
            console.warn('Auto-save Vercel URL skipped:', e)
          );
        }
      },
      (err) => {
        console.error('Admin settings subscription error:', err);
      }
    );

    return () => {
      unsubscribeRecords();
      unsubscribeSettings();
    };
  }, []);

  // Refresh manually
  const handleRefreshData = async () => {
    setIsSyncing(true);
    try {
      await checkAndSeedInitialData();
      showToast('info', 'Menyinkronkan data terbaru dengan Cloud Firestore...');
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  // 1. Submit New Record from Citizen Form
  const handleSubmitNewRecord = async (data: {
    nama: string;
    blok: string;
    nomor: string;
    status: StatusPemasangan;
    keterangan?: string;
    fotoBukti?: string;
  }) => {
    await addPdamRecord(data);
    showToast(
      'success',
      `Data meteran ${data.nama} (Blok ${data.blok} No. ${data.nomor}) berhasil disimpan!`
    );
  };

  // 2. Direct Status Change in Table
  const handleStatusChange = async (id: string, newStatus: StatusPemasangan) => {
    const target = records.find((r) => r.id === id);
    try {
      await updatePdamStatus(id, newStatus);
      showToast(
        'success',
        `Status ${target ? `Blok ${target.blok}/${target.nomor}` : 'unit'} diubah menjadi "${newStatus}".`
      );
    } catch (err: any) {
      showToast('error', 'Gagal memperbarui status: ' + (err.message || 'Coba lagi'));
    }
  };

  // 3. Edit Record Data
  const handleEditRecord = async (id: string, updated: Partial<PdamRecord>) => {
    try {
      await updatePdamRecord(id, updated);
      showToast('success', 'Perubahan data warga berhasil diperbarui!');
    } catch (err: any) {
      showToast('error', 'Gagal menyimpan perubahan: ' + (err.message || 'Coba lagi'));
    }
  };

  // 4. Request Delete Single Row (Protected by 6-digit PIN)
  const handleRequestDelete = (record: PdamRecord) => {
    setPinModalConfig({
      isOpen: true,
      title: 'Hapus Data Meteran Warga',
      description: `Apakah Anda yakin ingin menghapus data atas nama "${record.nama}" (Blok ${record.blok} No. ${record.nomor})? Tindakan ini dilindungi PIN pengurus.`,
      actionButtonText: 'Verifikasi & Hapus',
      onConfirm: async () => {
        try {
          await deletePdamRecord(record.id);
          showToast('success', `Data Blok ${record.blok}/${record.nomor} telah dihapus.`);
        } catch (err: any) {
          showToast('error', 'Gagal menghapus data: ' + (err.message || 'Coba lagi'));
        }
      },
    });
  };

  // 5. Request Reset Database (Protected by 6-digit PIN)
  const handleRequestReset = () => {
    setPinModalConfig({
      isOpen: true,
      title: 'Reset Database ke 46 Data Warga Lunas',
      description:
        'PERINGATAN: Tindakan ini akan mengembalikan seluruh data database menjadi 46 data master warga lunas (Blok B3, B5, B6, B7, B8). Masukkan 6 angka PIN pengurus untuk mengonfirmasi.',
      actionButtonText: 'Konfirmasi Reset Data',
      onConfirm: async () => {
        try {
          await resetDatabaseToDefault();
          showToast('success', 'Database berhasil di-reset ke 46 data master warga lunas.');
        } catch (err: any) {
          showToast('error', 'Gagal mereset database: ' + (err.message || 'Coba lagi'));
        }
      },
    });
  };

  // 6. Unlock Mode Pengurus (via Header)
  const handleOpenAdminUnlock = () => {
    setPinModalConfig({
      isOpen: true,
      title: 'Buka Mode Pengurus',
      description:
        'Masukkan 6 angka PIN pengurus untuk mengaktifkan wewenang pengurus (PIN default: 123456).',
      actionButtonText: 'Buka Mode Pengurus',
      onConfirm: () => {
        setIsAdminUnlocked(true);
        showToast('success', 'Mode Pengurus Berhasil Diaktifkan!');
      },
    });
  };

  // 7. Lock Mode Pengurus
  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    showToast('info', 'Mode Pengurus telah dikunci kembali.');
  };

  // 8. Update PIN Pengurus
  const handlePinUpdated = async (newPin: string) => {
    await updateAdminPin(newPin);
    setAdminPin(newPin);
    showToast('success', 'PIN Pengurus berhasil diganti dan disimpan ke Firestore!');
  };

  // 9. Akses Pengaturan Pengurus
  const handleOpenPengaturan = () => {
    if (isAdminUnlocked) {
      setIsPengaturanOpen(true);
    } else {
      setPinModalConfig({
        isOpen: true,
        title: 'Akses Pengaturan Pengurus',
        description:
          'Masukkan 6 angka PIN pengurus untuk membuka menu pengaturan (PIN default: 123456).',
        actionButtonText: 'Buka Pengaturan',
        onConfirm: () => {
          setIsAdminUnlocked(true);
          setIsPengaturanOpen(true);
          showToast('success', 'Menu Pengaturan Berhasil Dibuka');
        },
      });
    }
  };

  // 10. Export CSV & TXT (Tersedia saat kunci akun pengurus dibuka)
  const handleExportCsv = () => {
    if (records.length === 0) {
      showToast('info', 'Belum ada data untuk diunduh ke Excel.');
      return;
    }
    exportToCsv(records);
    showToast('success', 'File Excel/CSV hasil rekapan berhasil diunduh!');
  };

  const handleExportTxt = () => {
    if (records.length === 0) {
      showToast('info', 'Belum ada data untuk diunduh.');
      return;
    }
    exportToTxt(records);
    showToast('success', 'File Laporan Rekapan (.TXT) berhasil diunduh!');
  };

  // 11. Tab Switcher (1 Halaman 1 Tombol Yang Dipilih - Tanpa Perlu Geser Kebawah)
  const handleSelectTab = (tab: AppPageTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 12. Save Vercel Web Link
  const handleSaveVercelUrl = async (newUrl: string) => {
    try {
      const saved = await updateVercelUrl(newUrl, adminPin);
      setVercelUrl(saved);
      try {
        localStorage.setItem('pdam_vercel_url', saved);
      } catch {
        // Ignore storage errors
      }
      showToast('success', `Link Vercel berhasil disimpan: ${saved}`);
    } catch (err: any) {
      showToast('error', 'Gagal menyimpan link Vercel: ' + (err.message || 'Coba lagi'));
      throw err;
    }
  };

  // Resolve effective App URL (prioritize Vercel link!)
  const isRunningOnVercel =
    typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
  const envVercelUrl = import.meta.env.VITE_VERCEL_URL
    ? `https://${String(import.meta.env.VITE_VERCEL_URL).replace(/^https?:\/\//, '')}`
    : '';
  const effectiveAppUrl =
    (isRunningOnVercel ? window.location.origin : '') ||
    vercelUrl ||
    envVercelUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-cyan-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-300 max-w-sm">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border flex items-start gap-2.5 text-xs sm:text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            )}
            <div className="flex-1 leading-snug">{toast.text}</div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        isAdminUnlocked={isAdminUnlocked}
        onOpenPinModal={handleOpenAdminUnlock}
        onLockAdmin={handleLockAdmin}
        onOpenPengaturan={handleOpenPengaturan}
        onOpenShareWa={() => setIsShareWaOpen(true)}
        onRefreshData={handleRefreshData}
        isSyncing={isSyncing}
        recordsCount={records.length}
      />

      {/* Main Body with bottom padding for mobile sticky nav */}
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex-1 w-full space-y-4 pb-24 md:pb-8">
        {/* Loading Spinner on Initial Connection */}
        {isLoading ? (
          <div key="loading-view" className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-150">
            <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">
              Menghubungkan ke Cloud Firestore...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Memuat data real-time meteran PDAM Perumahan Saung Kebun
            </p>
          </div>
        ) : (
          <div key="loaded-view" className="space-y-4">
            {/* Top Navigation Tabs Bar (1 Halaman untuk 1 Tombol yang Dipilih) */}
            <div className="bg-white rounded-2xl p-1 shadow-xs border border-slate-200 grid grid-cols-3 md:flex items-center gap-1 overflow-hidden">
              <button
                type="button"
                onClick={() => handleSelectTab('rekap')}
                className={`min-w-0 md:flex-1 py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  activeTab === 'rekap'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate sm:hidden">Rekap</span>
                <span className="truncate hidden sm:inline">Rekap Data</span>
                {records.length > 0 && (
                  <span
                    className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 leading-none rounded-full font-black ${
                      activeTab === 'rekap' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {records.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('form')}
                className={`min-w-0 md:flex-1 py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate sm:hidden">Isi Data</span>
                <span className="truncate hidden sm:inline">Isi Data Warga</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('progress')}
                className={`min-w-0 md:flex-1 py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  activeTab === 'progress'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Progress 47</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('all')}
                title="Tampilkan Semua Bagian Sekaligus"
                className={`hidden md:flex py-2 px-3 rounded-xl text-xs font-bold transition items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 flex-shrink-0" />
                <span>Semua</span>
              </button>
            </div>

            {/* Panel Download Data Hasil Rekapan (Hanya Tampil Jika Kunci Akun Pengurus Dibuka) */}
            {isAdminUnlocked && (
              <div
                key="unlocked-recap-download-panel"
                className="bg-gradient-to-r from-emerald-50 via-sky-50 to-cyan-50 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      Akun Pengurus Terbuka — Download Data Hasil Rekapan
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Unduh seluruh rekapitulasi ({records.length} unit terdata) ke perangkat Anda.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Excel (.CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportTxt}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Laporan (.TXT)</span>
                  </button>
                </div>
              </div>
            )}

            {/* HALAMAN 1: HANYA TAMPIL REKAPITULASI DATA (1 Item Per Halaman di HP) */}
            {activeTab === 'rekap' && (
              <div key="tab-rekap" className="space-y-3">
                <TabelRekapitulasi
                  records={records}
                  onStatusChange={handleStatusChange}
                  onEditRecord={handleEditRecord}
                  onRequestDelete={handleRequestDelete}
                  onRequestReset={handleRequestReset}
                  onOpenExportWa={() => setIsExportWaOpen(true)}
                  onExportCsv={handleExportCsv}
                  onExportTxt={handleExportTxt}
                  isAdminUnlocked={isAdminUnlocked}
                />
              </div>
            )}

            {/* HALAMAN 2: HANYA TAMPIL FORMULIR PENDAFTARAN WARGA */}
            {activeTab === 'form' && (
              <div key="tab-form" className="max-w-xl mx-auto space-y-4">
                <FormInputWarga
                  existingRecords={records}
                  onSubmit={async (data) => {
                    await handleSubmitNewRecord(data);
                    // Setelah input berhasil, otomatis pindahkan ke halaman rekapitulasi data
                    setActiveTab('rekap');
                  }}
                />

                {/* Helpful info card */}
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-150 rounded-2xl p-4 text-xs text-sky-900 space-y-1.5 shadow-xs">
                  <div className="font-bold flex items-center gap-1.5 text-sky-800">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Informasi Pemasangan PDAM</span>
                  </div>
                  <p className="leading-relaxed text-sky-950">
                    Setiap warga yang telah melakukan pendaftaran atau telah dipasang meteran air dapat mengisi formulir di atas. Data akan langsung terupdate ke rekapitulasi pengurus secara otomatis.
                  </p>
                </div>
              </div>
            )}

            {/* HALAMAN 3: HANYA TAMPIL PROGRESS BAR & TARGET 47 UNIT */}
            {activeTab === 'progress' && (
              <div key="tab-progress" className="max-w-3xl mx-auto space-y-4">
                <ProgressBar records={records} />

                {/* Tombol Pintas ke Halaman Lain */}
                <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelectTab('rekap')}
                    className="px-4 py-2.5 bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-sky-800 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Lihat Rekapitulasi Data Warga</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('form')}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftarkan Pemasangan Baru</span>
                  </button>
                </div>
              </div>
            )}

            {/* HALAMAN 4: SEMUA BAGIAN (UNTUK MODE LAYAR LEBAR / DESKTOP JIKA DIINGINKAN) */}
            {activeTab === 'all' && (
              <div key="tab-all" className="space-y-6">
                <ProgressBar records={records} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <FormInputWarga
                      existingRecords={records}
                      onSubmit={handleSubmitNewRecord}
                    />
                  </div>
                  <div className="lg:col-span-7">
                    <TabelRekapitulasi
                      records={records}
                      onStatusChange={handleStatusChange}
                      onEditRecord={handleEditRecord}
                      onRequestDelete={handleRequestDelete}
                      onRequestReset={handleRequestReset}
                      onOpenExportWa={() => setIsExportWaOpen(true)}
                      onExportCsv={handleExportCsv}
                      onExportTxt={handleExportTxt}
                      isAdminUnlocked={isAdminUnlocked}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Perumahan Saung Kebun</span>
            <span>•</span>
            <span>Target 47 Unit PDAM TIRTA</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-600">RT/RW Saung Kebun</span>
            <span>•</span>
            <span>Database Cloud Firestore Real-time</span>
          </div>
        </div>
      </footer>

      {/* Bilah Navigasi Bawah Khusus Mobile / HP */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenShareWa={() => setIsShareWaOpen(true)}
        onOpenPengaturan={handleOpenPengaturan}
        recordsCount={records.length}
      />

      {/* Modals */}
      <PinModal
        isOpen={pinModalConfig.isOpen}
        onClose={() => setPinModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={pinModalConfig.onConfirm}
        correctPin={adminPin}
        title={pinModalConfig.title}
        description={pinModalConfig.description}
        actionButtonText={pinModalConfig.actionButtonText}
      />

      <ExportWaModal
        isOpen={isExportWaOpen}
        onClose={() => setIsExportWaOpen(false)}
        records={records}
      />

      <PengaturanModal
        isOpen={isPengaturanOpen}
        onClose={() => setIsPengaturanOpen(false)}
        currentPin={adminPin}
        onUpdatePin={handlePinUpdated}
        onRequestReset={handleRequestReset}
        onExportCsv={handleExportCsv}
        onExportTxt={handleExportTxt}
        appUrl={effectiveAppUrl}
        onSaveVercelUrl={handleSaveVercelUrl}
      />

      <ShareWaModal
        isOpen={isShareWaOpen}
        onClose={() => setIsShareWaOpen(false)}
        appUrl={effectiveAppUrl}
        onSaveVercelUrl={handleSaveVercelUrl}
        isAdminUnlocked={isAdminUnlocked}
      />
    </div>
  );
}
