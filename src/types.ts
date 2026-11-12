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
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSettings {
  pin: string;
  updatedAt?: string;
}

export const TARGET_TOTAL_UNIT = 47;

export const INITIAL_RECORDS: Omit<PdamRecord, 'id'>[] = [
  { nama: 'Sarma', blok: 'B3', nomor: '19', status: 'Sudah Terpasang' },
  { nama: 'Sugih', blok: 'B7', nomor: '23', status: 'Sudah Terpasang' },
  { nama: 'Dwi', blok: 'B5', nomor: '20', status: 'Sudah Terpasang' },
  { nama: 'Ardi', blok: 'B3', nomor: '20', status: 'Sudah Terpasang' },
];

export const DEFAULT_ADMIN_PIN = '123456';
