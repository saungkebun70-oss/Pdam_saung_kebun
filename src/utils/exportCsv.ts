import { PdamRecord, TARGET_TOTAL_UNIT } from '../types';

export function exportToCsv(records: PdamRecord[]): void {
  const headers = [
    'No',
    'Nama Warga',
    'Blok',
    'Nomor Rumah',
    'Alamat Lengkap',
    'Status Pemasangan',
    'Catatan / Keterangan',
    'Tanggal Update',
  ];

  const escapeField = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = records.map((rec, index) => {
    const formattedDate = rec.updatedAt
      ? new Date(rec.updatedAt).toLocaleString('id-ID')
      : '-';

    return [
      index + 1,
      escapeField(rec.nama),
      escapeField(rec.blok),
      escapeField(rec.nomor),
      escapeField(`Blok ${rec.blok} No. ${rec.nomor}`),
      escapeField(rec.status),
      escapeField(rec.keterangan || '-'),
      escapeField(formattedDate),
    ].join(',');
  });

  // Prepend UTF-8 BOM so Excel opens accents & characters correctly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Rekap_PDAM_Saung_Kebun_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToTxt(records: PdamRecord[]): void {
  const terpasangCount = records.filter((r) => r.status === 'Sudah Terpasang').length;
  const prosesCount = records.filter((r) => r.status === 'Dalam Proses').length;
  const belumCount = records.filter((r) => r.status === 'Belum Terpasang').length;
  const percent = Math.min(100, Math.round((terpasangCount / TARGET_TOTAL_UNIT) * 100));

  const nowStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [];
  lines.push(`LAPORAN HASIL REKAPAN PEMASANGAN METERAN PDAM`);
  lines.push(`PERUMAHAN SAUNG KEBUN`);
  lines.push(`Update: ${nowStr}`);
  lines.push(`===========================================`);
  lines.push(`Ringkasan Realisasi (Target ${TARGET_TOTAL_UNIT} Unit):`);
  lines.push(`- Sudah Terpasang : ${terpasangCount} Unit (${percent}%)`);
  lines.push(`- Dalam Proses    : ${prosesCount} Unit`);
  lines.push(`- Belum Terpasang : ${belumCount} Unit`);
  lines.push(`- Total Terdata   : ${records.length} Unit`);
  lines.push(`===========================================`);
  lines.push(`DAFTAR WARGA TERDATA:`);

  records.forEach((rec, index) => {
    const ket = rec.keterangan ? ` | Ket: ${rec.keterangan}` : '';
    lines.push(
      `${index + 1}. Nama: ${rec.nama} | Blok/No: ${rec.blok}/${rec.nomor} | Status: ${rec.status}${ket}`
    );
  });

  const content = lines.join('\r\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Laporan_Rekap_PDAM_Saung_Kebun_${now}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
