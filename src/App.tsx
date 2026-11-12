/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  subscribePdamRecords,
  subscribeAdminPin,
  addPdamRecord,
  updatePdamStatus,
  updatePdamRecord,
  deletePdamRecord,
  updateAdminPin,
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
import { exportToCsv } from './utils/exportCsv';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<PdamRecord[]>([]);
  const [adminPin, setAdminPin] = useState<string>(DEFAULT_ADMIN_PIN);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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

    const unsubscribePin = subscribeAdminPin(
      (pin) => {
        setAdminPin(pin);
      },
      (err) => {
        console.error('PIN subscription error:', err);
      }
    );

    return () => {
      unsubscribeRecords();
      unsubscribePin();
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
      title: 'Reset Database ke 4 Data Awal',
      description:
        'PERINGATAN: Tindakan ini akan mengembalikan seluruh data database menjadi 4 data awal perintis pengurus (Sarma, Sugih, Dwi, Ardi). Masukkan 6 angka PIN pengurus untuk mengonfirmasi.',
      actionButtonText: 'Konfirmasi Reset Data',
      onConfirm: async () => {
        try {
          await resetDatabaseToDefault();
          showToast('success', 'Database berhasil di-reset kembali ke 4 data awal pengurus.');
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

  // 10. Export CSV
  const handleExportCsv = () => {
    if (records.length === 0) {
      showToast('info', 'Belum ada data untuk diekspor ke Excel.');
      return;
    }
    exportToCsv(records);
    showToast('success', 'File Excel/CSV berhasil diunduh!');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-cyan-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-300 max-w-sm">
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

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 py-5 sm:py-6 flex-1 w-full space-y-6">
        {/* Loading Spinner on Initial Connection */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-150">
            <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">
              Menghubungkan ke Cloud Firestore...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Memuat data real-time meteran PDAM Perumahan Saung Kebun
            </p>
          </div>
        ) : (
          <>
            {/* Real-time Progress Bar & Target Breakdown */}
            <ProgressBar records={records} />

            {/* Two Column Grid for Desktop / Stacked for Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Input Warga (4 cols on lg) */}
              <div className="lg:col-span-5 space-y-4">
                <FormInputWarga
                  existingRecords={records}
                  onSubmit={handleSubmitNewRecord}
                />

                {/* Helpful info card */}
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-150 rounded-2xl p-4 text-xs text-sky-900 space-y-1.5 shadow-xs">
                  <div className="font-bold flex items-center gap-1.5 text-sky-800">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Informasi Pemasangan PDAM
                  </div>
                  <p className="leading-relaxed text-sky-950">
                    Setiap warga yang telah melakukan pendaftaran atau telah dipasang meteran air dapat mengisi formulir di atas. Data akan langsung terupdate ke rekapitulasi pengurus secara otomatis.
                  </p>
                </div>
              </div>

              {/* Tabel Rekapitulasi Real-time (7 cols on lg) */}
              <div className="lg:col-span-7">
                <TabelRekapitulasi
                  records={records}
                  onStatusChange={handleStatusChange}
                  onEditRecord={handleEditRecord}
                  onRequestDelete={handleRequestDelete}
                  onRequestReset={handleRequestReset}
                  onOpenExportWa={() => setIsExportWaOpen(true)}
                  onExportCsv={handleExportCsv}
                  isAdminUnlocked={isAdminUnlocked}
                />
              </div>
            </div>
          </>
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
        appUrl={window.location.origin}
      />

      <ShareWaModal
        isOpen={isShareWaOpen}
        onClose={() => setIsShareWaOpen(false)}
        appUrl={window.location.origin}
      />
    </div>
  );
}
