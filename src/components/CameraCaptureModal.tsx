import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  X,
  SwitchCamera,
  RotateCcw,
  Check,
  ImagePlus,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { compressProofImage, compressSourceToProof } from '../utils/imageCompress';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (result: { dataUrl: string; sizeKb: number }) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStarting, setIsStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<{ dataUrl: string; sizeKb: number } | null>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const exitNativeFullscreen = useCallback(() => {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      stopCameraStream();
      setCameraError(null);
      setIsStarting(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsStarting(false);
        setCameraError('Browser tidak mendukung kamera langsung. Gunakan tombol kamera/galeri di bawah.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        const msg =
          err?.name === 'NotAllowedError'
            ? 'Izin kamera ditolak oleh browser. Aktifkan izin kamera atau gunakan tombol di bawah.'
            : err?.name === 'NotFoundError'
            ? 'Kamera tidak ditemukan di perangkat ini. Anda tetap bisa memilih foto dari galeri.'
            : 'Tidak dapat membuka kamera langsung. Gunakan tombol kamera/galeri di bawah.';
        setCameraError(msg);
      } finally {
        setIsStarting(false);
      }
    },
    [stopCameraStream]
  );

  // Enter fullscreen & start camera when opened
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      exitNativeFullscreen();
      setCaptured(null);
      setCameraError(null);
      return;
    }

    // Lock body scroll while fullscreen camera is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Try browser native Fullscreen API (falls back seamlessly to fixed inset-0 100dvh overlay)
    const el = containerRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }

    const onFsChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);

    if (!captured) {
      startCamera(facingMode);
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFsChange);
      stopCameraStream();
    };
  }, [isOpen, facingMode, captured, startCamera, stopCameraStream, exitNativeFullscreen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      exitNativeFullscreen();
    };
  }, [stopCameraStream, exitNativeFullscreen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleClose = () => {
    stopCameraStream();
    exitNativeFullscreen();
    onClose();
  };

  const handleToggleNativeFullscreen = () => {
    if (document.fullscreenElement) {
      exitNativeFullscreen();
    } else if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    try {
      const result = compressSourceToProof(
        video,
        video.videoWidth,
        video.videoHeight,
        facingMode === 'user'
      );
      stopCameraStream();
      setCaptured(result);
    } catch (err: any) {
      setCameraError(err?.message || 'Gagal mengambil gambar dari kamera.');
    }
  };

  const handleFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const result = await compressProofImage(file);
      stopCameraStream();
      setCaptured(result);
      setCameraError(null);
    } catch (err: any) {
      setCameraError(err?.message || 'Gagal memproses foto.');
    }
  };

  const handleConfirmPhoto = () => {
    if (!captured) return;
    const finalPhoto = captured;
    stopCameraStream();
    exitNativeFullscreen();
    onCapture(finalPhoto);
    onClose();
  };

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] w-screen h-dvh bg-black text-white flex flex-col justify-between overflow-hidden select-none"
    >
      <input
        ref={fallbackInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFallbackFile}
        className="hidden"
      />

      {/* Top Overlay Bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-b from-black/80 via-black/45 to-transparent">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 bg-sky-600/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md max-w-full">
            <Camera className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{title || 'Kamera Bukti Meteran PDAM'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!captured && (
            <button
              type="button"
              onClick={() =>
                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
              }
              title="Ganti Kamera Depan / Belakang"
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white transition cursor-pointer"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleNativeFullscreen}
            title={isNativeFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white transition cursor-pointer"
          >
            {isNativeFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            title="Tutup Kamera"
            className="p-2.5 rounded-full bg-rose-600/85 hover:bg-rose-600 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Full-Screen Viewfinder or Captured Preview */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {captured ? (
          <img
            src={captured.dataUrl}
            alt="Hasil Foto Bukti Meteran"
            className="w-full h-full object-contain"
          />
        ) : cameraError ? (
          <div className="relative z-10 max-w-sm mx-4 p-5 rounded-2xl bg-slate-900/95 border border-slate-700 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <div className="text-sm font-bold text-white">Kamera Langsung Tidak Tersedia</div>
            <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
            <button
              type="button"
              onClick={() => fallbackInputRef.current?.click()}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Buka Kamera HP / Pilih Foto</span>
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Framing Guide */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-md aspect-[4/3] border-2 border-white/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.28)] relative">
                <div className="absolute -top-8 inset-x-0 text-center">
                  <span className="bg-black/65 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                    Posisikan Meteran PDAM &amp; Nomor Rumah di dalam bingkai
                  </span>
                </div>
              </div>
            </div>

            {isStarting && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-200 font-semibold">
                  Membuka kamera layar penuh...
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-20 px-5 py-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {captured ? (
          <div className="max-w-md mx-auto space-y-3">
            <div className="text-center text-xs text-emerald-300 font-semibold">
              Foto siap digunakan ({captured.sizeKb} KB)
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCaptured(null)}
                className="flex-1 py-3.5 px-4 bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => fallbackInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-white/85 hover:text-white transition cursor-pointer w-16"
            >
              <div className="p-3 rounded-full bg-white/15 backdrop-blur-xs">
                <ImagePlus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Galeri</span>
            </button>

            {/* Big Shutter Button */}
            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={isStarting || Boolean(cameraError)}
              aria-label="Ambil Foto"
              className="w-20 h-20 rounded-full border-4 border-white p-1.5 flex items-center justify-center active:scale-95 transition cursor-pointer disabled:opacity-40"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-sky-100 transition" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="flex flex-col items-center gap-1 text-white/85 hover:text-white transition cursor-pointer w-16"
            >
              <div className="p-3 rounded-full bg-white/15 backdrop-blur-xs">
                <X className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Batal</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
