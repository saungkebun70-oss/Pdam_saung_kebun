import React, { useState } from 'react';
import { BookOpen, X, Database, Shield, Rocket, Smartphone, Copy, Check, Terminal } from 'lucide-react';
import firebaseConfig from '@/firebase-applet-config.json';

interface PanduanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PanduanModal: React.FC<PanduanModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'pengurus' | 'deploy' | 'warga'>('firebase');
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const configSnippet = `// File: firebase-applet-config.json
{
  "projectId": "${firebaseConfig.projectId || 'project-anda'}",
  "apiKey": "${firebaseConfig.apiKey || 'AIzaSy...'}",
  "authDomain": "${firebaseConfig.authDomain || 'project-anda.firebaseapp.com'}",
  "firestoreDatabaseId": "${firebaseConfig.firestoreDatabaseId || '(default)'}",
  "storageBucket": "${firebaseConfig.storageBucket || 'project-anda.firebasestorage.app'}"
}`;

  const copyConfigText = () => {
    navigator.clipboard.writeText(configSnippet);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight">
                Panduan Konfigurasi Firebase &amp; Deploy
              </h4>
              <span className="text-[11px] text-slate-400">
                Dokumentasi Lengkap PDAM Saung Kebun
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 border-b border-slate-200 pt-3 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'firebase'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firebase &amp; Firestore</span>
          </button>

          <button
            onClick={() => setActiveTab('pengurus')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'pengurus'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Keamanan &amp; PIN Pengurus</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'deploy'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Cara Deploy</span>
          </button>

          <button
            onClick={() => setActiveTab('warga')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'warga'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Penggunaan Warga</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed pr-1">
          {activeTab === 'firebase' && (
            <div className="space-y-3">
              <div className="bg-sky-50 border border-sky-150 p-3.5 rounded-xl">
                <h5 className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-sky-700" />
                  Koleksi &amp; Struktur Firestore Aktif
                </h5>
                <ul className="list-disc list-inside space-y-1 text-sky-950 text-xs mt-2">
                  <li>
                    <strong>pdam_saung_kebun</strong>: Menyimpan data setiap rumah (nama, blok, nomor, status, catatan).
                  </li>
                  <li>
                    <strong>settings/admin</strong>: Menyimpan PIN 6 angka pengurus (default: <code>123456</code>).
                  </li>
                  <li>
                    <strong>Data Awal Otomatis</strong>: Jika koleksi kosong, 4 data perintis (Sarma B3/19, Sugih B7/23, Dwi B5/20, Ardi B3/20) otomatis diisi.
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 text-xs">Konfigurasi Firebase Saat Ini:</span>
                  <button
                    onClick={copyConfigText}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
                  >
                    {copiedConfig ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedConfig ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto">
                  {configSnippet}
                </pre>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                <strong>Aturan Keamanan (firestore.rules):</strong>
                <p className="text-slate-600">
                  Semua warga dapat membaca rekapitulasi data dan menambahkan status pemasangan meteran secara publik. Tindakan perubahan status dan penghapusan diamankan oleh validasi skema serta otorisasi PIN 6 angka pengurus.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pengurus' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs space-y-2">
                <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-700" />
                  PIN 6 Angka Pengurus Saung Kebun
                </h5>
                <p className="text-amber-950">
                  PIN standar bawaan adalah: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300">123456</span>
                </p>
                <p className="text-amber-950">
                  Untuk keamanan jangka panjang, pengurus disarankan mengubah PIN melalui tombol <strong>Mode Pengurus &rarr; Ubah PIN</strong> di pojok kanan atas aplikasi.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h6 className="font-bold text-slate-800">Fitur Terproteksi PIN:</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border rounded-xl">
                    <span className="font-bold text-slate-700 block">Hapus Baris Warga</span>
                    <span className="text-slate-500 text-[11px]">Mencegah warga tidak sengaja menghapus nomor kavling lain.</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl">
                    <span className="font-bold text-slate-700 block">Reset Database</span>
                    <span className="text-slate-500 text-[11px]">Mengembalikan data ke 4 data awal resmi panitia.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Rocket className="w-4 h-4 text-cyan-600" />
                  Opsi Deployment ke Internet
                </h5>
                <p className="text-slate-600">
                  Aplikasi ini adalah React SPA modern bertenaga Vite yang dapat di-hosting secara gratis di berbagai penyedia layanan cloud:
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Opsi 1 */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">1. Vercel (Paling Cepat &amp; Gratis)</div>
                  <p className="text-slate-600 mb-2">
                    Cukup hubungkan repository GitHub proyek ini ke Vercel. Vercel akan otomatis mendeteksi konfigurasi Vite dan menghasilkan link HTTPS siap pakai.
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-2 rounded-lg font-mono text-[11px]">
                    npm run build
                  </div>
                </div>

                {/* Opsi 2 */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 mb-1">2. Firebase Hosting</div>
                  <p className="text-slate-600 mb-2">
                    Hosting satu atap dengan database Firestore yang sudah kita hubungkan.
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-2 rounded-lg font-mono text-[11px] space-y-1">
                    <div>npm install -g firebase-tools</div>
                    <div>firebase login &amp;&amp; firebase init hosting</div>
                    <div>npm run build &amp;&amp; firebase deploy --only hosting</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'warga' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-cyan-50 border border-cyan-150 rounded-xl">
                <h5 className="font-bold text-cyan-900 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-700" />
                  Kemudahan Akses untuk Warga
                </h5>
                <p className="text-cyan-950">
                  Warga cukup membuka tautan web dari browser HP (Chrome, Safari, dsb) tanpa perlu login atau instal aplikasi via Play Store / App Store:
                </p>
                <ol className="list-decimal list-inside space-y-1 mt-2 text-cyan-900">
                  <li>Buka link formulir yang dibagikan pengurus di grup WhatsApp.</li>
                  <li>Ketik Nama Lengkap dan pilih Blok serta Nomor Rumah.</li>
                  <li>Pilih Status Pemasangan (Sudah Terpasang / Dalam Proses / Belum).</li>
                  <li>Tekan "Simpan Data Meteran Warga" &rarr; data langsung muncul di layar semua warga secara real-time.</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">Proteksi Anti Dobel:</span>
                <p className="text-slate-600">
                  Sistem otomatis menolak pendaftaran jika kombinasi Blok dan Nomor Rumah sudah pernah dicatat, mencegah duplikasi perhitungan unit dari target 47 rumah.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
