import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Trash2,
  Edit2,
  FileSpreadsheet,
  MessageSquare,
  RotateCcw,
  X,
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { PdamRecord, StatusPemasangan } from '../types';
import { EditRecordModal } from './EditRecordModal';

interface TabelRekapitulasiProps {
  records: PdamRecord[];
  onStatusChange: (id: string, newStatus: StatusPemasangan) => Promise<void>;
  onEditRecord: (id: string, updated: Partial<PdamRecord>) => Promise<void>;
  onRequestDelete: (record: PdamRecord) => void;
  onRequestReset: () => void;
  onOpenExportWa: () => void;
  onExportCsv: () => void;
  isAdminUnlocked: boolean;
}

const BLOK_FILTER_LIST: string[] = [
  'Semua',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8',
  'Pos Keamanan',
  'Lainnya',
];

// Helper to compute smart page numbers window
function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export const TabelRekapitulasi: React.FC<TabelRekapitulasiProps> = ({
  records = [],
  onStatusChange,
  onEditRecord,
  onRequestDelete,
  onRequestReset,
  onOpenExportWa,
  onExportCsv,
  isAdminUnlocked,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlok, setSelectedBlok] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [sortBy, setSortBy] = useState<'blok' | 'nama' | 'tanggal'>('blok');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<PdamRecord | null>(null);

  // Filtered and Sorted Records with comprehensive type safety
  const filteredRecords = useMemo(() => {
    const list = Array.isArray(records) ? records : [];

    return list
      .filter((rec) => {
        if (!rec) return false;

        const recBlok = String(rec.blok || '').trim();
        const recNama = String(rec.nama || '').trim();
        const recNomor = String(rec.nomor || '').trim();
        const recKet = String(rec.keterangan || '').trim();
        const recStatus = String(rec.status || '');

        // Blok filter
        if (selectedBlok !== 'Semua') {
          if (selectedBlok === 'Lainnya') {
            const standardBloks = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'Pos Keamanan'];
            if (standardBloks.includes(recBlok)) return false;
          } else if (recBlok.toLowerCase() !== selectedBlok.toLowerCase()) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'Semua' && recStatus !== selectedStatus) {
          return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchNama = recNama.toLowerCase().includes(term);
          const matchBlok = recBlok.toLowerCase().includes(term);
          const matchNomor = recNomor.toLowerCase().includes(term);
          const matchKet = recKet.toLowerCase().includes(term);
          const matchGabung = `${recBlok}${recNomor}`.toLowerCase().includes(term);
          if (!matchNama && !matchBlok && !matchNomor && !matchKet && !matchGabung) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const namaA = String(a?.nama || '');
        const namaB = String(b?.nama || '');
        if (sortBy === 'nama') {
          return namaA.localeCompare(namaB);
        }
        if (sortBy === 'tanggal') {
          return String(b?.updatedAt || '').localeCompare(String(a?.updatedAt || ''));
        }
        // Default: Sort by Blok then Nomor safely
        const blokA = String(a?.blok || '');
        const blokB = String(b?.blok || '');
        if (blokA !== blokB) {
          return blokA.localeCompare(blokB, undefined, { numeric: true });
        }
        const noA = String(a?.nomor || '');
        const noB = String(b?.nomor || '');
        return noA.localeCompare(noB, undefined, { numeric: true });
      });
  }, [records, selectedBlok, selectedStatus, searchTerm, sortBy]);

  // Pagination Calculations
  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, startIndex, endIndex]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-150 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Rekapitulasi Pemasangan Meteran PDAM
            </h3>
            <span className="bg-cyan-100 text-cyan-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
              {filteredRecords.length} / {records.length} Unit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar warga real-time. Ketuk ikon pensil untuk mengedit data warga.
          </p>
        </div>

        {/* Action Buttons: WA, CSV, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenExportWa}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Salin Format WA (1–47)</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={onRequestReset}
            title="Reset ke 4 data awal pengurus (Dilindungi PIN)"
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-150 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama warga, nomor rumah, atau blok..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-150 text-xs sm:text-sm outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-4 flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap hidden lg:inline">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Semua">Semua Status Pemasangan</option>
              <option value="Sudah Terpasang">Sudah Terpasang</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Belum Terpasang">Belum Terpasang</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="blok">Urut: Blok &amp; No Rumah</option>
              <option value="nama">Urut: Nama Warga (A-Z)</option>
              <option value="tanggal">Urut: Terbaru Diubah</option>
            </select>
          </div>
        </div>

        {/* Blok Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
            <Building2 className="w-3.5 h-3.5" /> Blok:
          </span>
          {BLOK_FILTER_LIST.map((blok) => (
            <button
              key={blok}
              onClick={() => {
                setSelectedBlok(blok);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex-shrink-0 cursor-pointer ${
                selectedBlok === blok
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {blok}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {filteredRecords.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">Tidak ada data ditemukan</h4>
          <p className="text-xs text-slate-400 mt-1">
            Coba sesuaikan kata kunci pencarian atau ubah pilihan filter blok/status.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (sm+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-32">Blok &amp; No</th>
                  <th className="py-3 px-4">Nama Lengkap Warga</th>
                  <th className="py-3 px-4 w-44">Status Pemasangan</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRecords.map((rec, idx) => {
                  const rowNumber = startIndex + idx + 1;
                  const recordId = rec.id || `idx-${rowNumber}`;
                  const recBlok = String(rec.blok || '');
                  const recNomor = String(rec.nomor || '');
                  const recNama = String(rec.nama || '');
                  const recKet = String(rec.keterangan || '');

                  return (
                    <tr
                      key={recordId}
                      className="hover:bg-sky-50/40 transition duration-150"
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {rowNumber}
                      </td>

                      {/* Blok & No */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {recBlok} / {recNomor}
                        </span>
                      </td>

                      {/* Nama Warga */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {recNama}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={rec.status || 'Belum Terpasang'}
                          onChange={(e) =>
                            onStatusChange(rec.id, e.target.value as StatusPemasangan)
                          }
                          className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border outline-none cursor-pointer transition ${
                            rec.status === 'Sudah Terpasang'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : rec.status === 'Dalam Proses'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="Sudah Terpasang">✓ Sudah Terpasang</option>
                          <option value="Dalam Proses">⏳ Dalam Proses</option>
                          <option value="Belum Terpasang">✗ Belum Terpasang</option>
                        </select>
                      </td>

                      {/* Catatan */}
                      <td className="py-3 px-4">
                        <span className="text-slate-500 italic">
                          {recKet || '-'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingRecord(rec)}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                            title="Edit Data Warga"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDelete(rec)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Data (Wajib PIN)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (<md) */}
          <div className="md:hidden divide-y divide-slate-150">
            {paginatedRecords.map((rec, idx) => {
              const rowNumber = startIndex + idx + 1;
              const recordId = rec.id || `idx-${rowNumber}`;
              const recBlok = String(rec.blok || '');
              const recNomor = String(rec.nomor || '');
              const recNama = String(rec.nama || '');
              const recKet = String(rec.keterangan || '');

              return (
                <div key={recordId} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-6">
                        #{rowNumber}
                      </span>
                      <span className="px-2.5 py-0.5 font-bold text-xs bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                        Blok {recBlok} / {recNomor}
                      </span>
                    </div>

                    {/* Action buttons on mobile */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingRecord(rec)}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-sky-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onRequestDelete(rec)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Resident Name */}
                  <div className="text-sm font-bold text-slate-900">
                    {recNama}
                  </div>

                  {/* Status Change Dropdown */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-slate-500 font-medium">Status PDAM:</span>
                    <select
                      value={rec.status || 'Belum Terpasang'}
                      onChange={(e) =>
                        onStatusChange(rec.id, e.target.value as StatusPemasangan)
                      }
                      className={`text-xs font-bold py-1.5 px-2.5 rounded-lg border outline-none cursor-pointer ${
                        rec.status === 'Sudah Terpasang'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : rec.status === 'Dalam Proses'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="Sudah Terpasang">✓ Sudah Terpasang</option>
                      <option value="Dalam Proses">⏳ Dalam Proses</option>
                      <option value="Belum Terpasang">✗ Belum Terpasang</option>
                    </select>
                  </div>

                  {/* Catatan if any */}
                  {recKet && (
                    <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {recKet}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination Bar (Navigasi Bawah Per Halaman) */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Items per Page Selector & Info */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span>Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value={5}>5 per halaman</option>
                  <option value={10}>10 per halaman</option>
                  <option value={15}>15 per halaman</option>
                  <option value={25}>25 per halaman</option>
                  <option value={50}>50 per halaman (Semua)</option>
                </select>
              </div>

              <span className="text-slate-500 text-[11px] font-semibold">
                {totalItems === 0 ? '0 data' : `${startIndex + 1}–${endIndex} dari ${totalItems} data`}
              </span>
            </div>

            {/* Right: Page Navigation Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="Halaman Pertama"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Prev Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Halaman Sebelumnya"
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold flex items-center gap-1 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Prev</span>
                </button>

                {/* Number Pills */}
                <div className="flex items-center gap-1 mx-0.5">
                  {getPageNumbers(currentPage, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-slate-400 font-bold">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => setCurrentPage(Number(p))}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentPage === p
                            ? 'bg-sky-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Halaman Selanjutnya"
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold flex items-center gap-1 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Halaman Terakhir"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dedicated Edit Record Modal */}
      <EditRecordModal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
        existingRecords={records}
        onSave={async (id, updated) => {
          await onEditRecord(id, updated);
          setEditingRecord(null);
        }}
      />
    </div>
  );
};
