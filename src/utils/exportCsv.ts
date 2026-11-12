import { PdamRecord } from '../types';

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
