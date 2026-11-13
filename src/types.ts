export type StatusPemasangan = 'Sudah Terpasang' | 'Dalam Proses' | 'Belum Terpasang';

export type BlokPilihan =
  | 'B1'
  | 'B2'
  | 'B3'
  | 'B4'
  | 'B5'
  | 'B6'
  | 'B7'
  | 'B8'
  | 'Pos Keamanan'
  | 'Lainnya';

export interface PdamRecord {
  id: string;
  nama: string;
  blok: string;
  nomor: string;
  status: StatusPemasangan;
  keterangan?: string;
  fotoBukti?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSettings {
  pin: string;
  vercelUrl?: string;
  dataVersion?: number;
  updatedAt?: string;
}

export const TARGET_TOTAL_UNIT = 47;
export const MASTER_DATA_VERSION = 2;

export const INITIAL_RECORDS: Omit<PdamRecord, 'id'>[] = [
  // Blok B3 (12)
  { nama: 'Asep', blok: 'B3', nomor: '01', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Subhan', blok: 'B3', nomor: '02', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Affan', blok: 'B3', nomor: '06', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Erlangga', blok: 'B3', nomor: '07', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Raka', blok: 'B3', nomor: '08', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Puguh', blok: 'B3', nomor: '12', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Wendy', blok: 'B3', nomor: '15', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Casmat', blok: 'B3', nomor: '18', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Sarma', blok: 'B3', nomor: '19', status: 'Sudah Terpasang', keterangan: 'LUNAS' },
  { nama: 'Ardi', blok: 'B3', nomor: '20', status: 'Sudah Terpasang', keterangan: 'LUNAS' },
  { nama: 'Cecep', blok: 'B3', nomor: '21', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Faisal', blok: 'B3', nomor: '23', status: 'Dalam Proses', keterangan: 'LUNAS' },

  // Blok B5 (9)
  { nama: 'Tina', blok: 'B5', nomor: '07', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Hermi', blok: 'B5', nomor: '12', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Kurniawan', blok: 'B5', nomor: '17', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Dwi', blok: 'B5', nomor: '20', status: 'Sudah Terpasang', keterangan: 'LUNAS' },
  { nama: 'Aditya', blok: 'B5', nomor: '23', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Dedy', blok: 'B5', nomor: '24', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Sigit', blok: 'B5', nomor: '25', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Hartono', blok: 'B5', nomor: '26', status: 'Sudah Terpasang', keterangan: 'LUNAS' },
  { nama: 'Syahri', blok: 'B5', nomor: '27', status: 'Dalam Proses', keterangan: 'LUNAS' },

  // Blok B6 (7)
  { nama: 'Defry', blok: 'B6', nomor: '02', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Ridwan', blok: 'B6', nomor: '04', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Novi', blok: 'B6', nomor: '07', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Rully', blok: 'B6', nomor: '12', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Sutrisman', blok: 'B6', nomor: '18', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Dik', blok: 'B6', nomor: '19', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Ineu Badriah', blok: 'B6', nomor: '23', status: 'Dalam Proses', keterangan: 'LUNAS' },

  // Blok B7 (11)
  { nama: 'Firdaus', blok: 'B7', nomor: '04', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Billy', blok: 'B7', nomor: '06', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Bagas', blok: 'B7', nomor: '07', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Cecep Hidayat', blok: 'B7', nomor: '08', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Faizun', blok: 'B7', nomor: '09', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Akbar', blok: 'B7', nomor: '10', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Nafi', blok: 'B7', nomor: '14', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Andri', blok: 'B7', nomor: '16', status: 'Sudah Terpasang', keterangan: 'LUNAS' },
  { nama: 'Mutiara', blok: 'B7', nomor: '17', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Alvin', blok: 'B7', nomor: '20', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Sugih', blok: 'B7', nomor: '23', status: 'Sudah Terpasang', keterangan: 'LUNAS' },

  // Blok B8 (7)
  { nama: 'Candra', blok: 'B8', nomor: '01', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Subandi', blok: 'B8', nomor: '02', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Diki Permadi', blok: 'B8', nomor: '03', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Tham', blok: 'B8', nomor: '04', status: 'Dalam Proses', keterangan: 'LUNAS' },
  { nama: 'Bintang Dwi Cahya', blok: 'B8', nomor: '08', status: 'Sudah Terpasang', keterangan: 'LUNAS' },
  { nama: 'Rostini', blok: 'B8', nomor: '10', status: 'Sudah Terpasang', keterangan: 'LUNAS' },
  { nama: 'Husni', blok: 'B8', nomor: '11', status: 'Dalam Proses', keterangan: 'LUNAS' },
];

export const DEFAULT_ADMIN_PIN = '123456';
export const DEFAULT_VERCEL_URL = 'https://pdam-saung-kebun.vercel.app';
