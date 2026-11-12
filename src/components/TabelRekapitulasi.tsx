import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  MessageSquare,
  RotateCcw,
  Home,
  Check,
  X,
  ArrowUpDown,
  Building2,
} from 'lucide-react';
import { PdamRecord, StatusPemasangan, BlokPilihan } from '../types';

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

const BLOK_FILTER_LIST: (string)[] = [
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

export const TabelRekapitulasi: React.FC<TabelRekapitulasiProps> = ({
  records,
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

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editBlok, setEditBlok] = useState('');
  const [editNomor, setEditNomor] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');

  const startEdit = (rec: PdamRecord) => {
    setEditingId(rec.id);
    setEditNama(rec.nama);
    setEditBlok(rec.blok);
    setEditNomor(rec.nomor);
    setEditKeterangan(rec.keterangan || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editNama.trim() || !editBlok.trim() || !editNomor.trim()) return;
    await onEditRecord(id, {
      nama: editNama.trim(),
      blok: editBlok.trim(),
      nomor: editNomor.trim(),
      keterangan: editKeterangan.trim(),
    });
    setEditingId(null);
  };

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Blok filter
        if (selectedBlok !== 'Semua') {
          if (selectedBlok === 'Lainnya') {
            const standardBloks = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'Pos Keamanan'];
            if (standardBloks.includes(rec.blok)) return false;
          } else if (rec.blok !== selectedBlok) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'Semua' && rec.status !== selectedStatus) {
          return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchNama = rec.nama.toLowerCase().includes(term);
          const matchBlok = rec.blok.toLowerCase().includes(term);
          const matchNomor = rec.nomor.toLowerCase().includes(term);
          const matchKet = (rec.keterangan || '').toLowerCase().includes(term);
          const matchGabung = `${rec.blok}${rec.nomor}`.toLowerCase().includes(term);
          if (!matchNama && !matchBlok && !matchNomor && !matchKet && !matchGabung) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nama') {
          return a.nama.localeCompare(b.nama);
        }
        if (sortBy === 'tanggal') {
          return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        }
        // Default: Sort by Blok then Nomor
        if (a.blok !== b.blok) return a.blok.localeCompare(b.blok, undefined, { numeric: true });
        return a.nomor.localeCompare(b.nomor, undefined, { numeric: true });
      });
  }, [records, selectedBlok, selectedStatus, searchTerm, sortBy]);

  const getStatusBadge = (status: StatusPemasangan) => {
    switch (status) {
      case 'Sudah Terpasang':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sudah Terpasang</span>
          </span>
        );
      case 'Dalam Proses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Dalam Proses</span>
          </span>
        );
      case 'Belum Terpasang':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Belum Terpasang</span>
          </span>
        );
    }
  };

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
            Daftar warga real-time. Ubah status langsung dari menu pilihan tabel.
          </p>
        </div>

        {/* Action Buttons: WA, CSV, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenExportWa}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Salin Format WA (1–47)</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={onRequestReset}
            title="Reset ke 4 data awal pengurus (Dilindungi PIN)"
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama warga, nomor rumah, atau blok..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-150 text-xs sm:text-sm outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500"
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
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500"
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
              onClick={() => setSelectedBlok(blok)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex-shrink-0 ${
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
                {filteredRecords.map((rec, idx) => {
                  const isEditing = editingId === rec.id;

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-sky-50/40 transition duration-150 ${
                        isEditing ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Blok & No */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={editBlok}
                              onChange={(e) => setEditBlok(e.target.value)}
                              className="w-14 px-1.5 py-1 text-xs border rounded bg-white"
                              placeholder="Blok"
                            />
                            <input
                              type="text"
                              value={editNomor}
                              onChange={(e) => setEditNomor(e.target.value)}
                              className="w-14 px-1.5 py-1 text-xs border rounded bg-white"
                              placeholder="No"
                            />
                          </div>
                        ) : (
                          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {rec.blok} / {rec.nomor}
                          </span>
                        )}
                      </td>

                      {/* Nama Warga */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            className="w-full px-2 py-1 text-xs border rounded bg-white font-semibold"
                          />
                        ) : (
                          <div className="font-semibold text-slate-800 text-sm">{rec.nama}</div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={rec.status}
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
                        {isEditing ? (
                          <input
                            type="text"
                            value={editKeterangan}
                            onChange={(e) => setEditKeterangan(e.target.value)}
                            className="w-full px-2 py-1 text-xs border rounded bg-white"
                            placeholder="Catatan..."
                          />
                        ) : (
                          <span className="text-slate-500 italic">
                            {rec.keterangan || '-'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(rec.id)}
                              className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                              title="Simpan Perubahan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEdit(rec)}
                              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                              title="Koreksi Nama / No Rumah"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRequestDelete(rec)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Data (Wajib PIN)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (<md) */}
          <div className="md:hidden divide-y divide-slate-150">
            {filteredRecords.map((rec, idx) => {
              const isEditing = editingId === rec.id;

              return (
                <div key={rec.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5">
                        #{idx + 1}
                      </span>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editBlok}
                            onChange={(e) => setEditBlok(e.target.value)}
                            className="w-14 px-1.5 py-1 text-xs border rounded bg-white"
                            placeholder="Blok"
                          />
                          <input
                            type="text"
                            value={editNomor}
                            onChange={(e) => setEditNomor(e.target.value)}
                            className="w-14 px-1.5 py-1 text-xs border rounded bg-white"
                            placeholder="No"
                          />
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 font-bold text-xs bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                          Blok {rec.blok} / {rec.nomor}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => saveEdit(rec.id)}
                          className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-lg flex items-center gap-1 font-semibold"
                        >
                          <Check className="w-3 h-3" /> Simpan
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(rec)}
                          className="p-1.5 text-slate-500 hover:text-sky-700 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDelete(rec)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Resident Name */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm font-bold border rounded-lg bg-white"
                      placeholder="Nama Lengkap Warga"
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-900">
                      {rec.nama}
                    </div>
                  )}

                  {/* Status Change Dropdown */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-slate-500 font-medium">Status PDAM:</span>
                    <select
                      value={rec.status}
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editKeterangan}
                      onChange={(e) => setEditKeterangan(e.target.value)}
                      className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
                      placeholder="Catatan tambahan..."
                    />
                  ) : (
                    rec.keterangan && (
                      <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {rec.keterangan}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
