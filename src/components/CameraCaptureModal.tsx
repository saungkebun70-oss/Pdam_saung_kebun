import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, ImagePlus, AlertCircle } from 'lucide-react';
import { compressProofImage, compressVideoFrame } from '../utils/imageCompress';

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
  title = 'Ambil Foto Bukti Meteran PDAM',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let cancelled = false;
    const startCamera = async () => {
      setIsLoadingCamera(true);
      setCameraError(null);
      stopStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser tidak mendukung kamera langsung. Gunakan tombol kamera/galeri di bawah.');
        setIsLoadingCamera(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        if (!cancelled) {
          setCameraError(
            err?.name === 'NotAllowedError'
              ? 'Izin kamera ditolak oleh browser. Anda tetap bisa memilih foto atau membuka kamera perangkat lewat tombol di bawah.'
              : 'Kamera langsung tidak tersedia pada perangkat ini. Gunakan tombol di bawah untuk mengambil atau memilih foto.'
          );
        }
      } finally {
        if (!cancelled) setIsLoadingCamera(false);
      }
    };

    startCamera();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleTakeSnapshot = () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const result = compressVideoFrame(videoRef.current);
      stopStream();
      onCapture(result);
      onClose();
    } catch (err: any) {
      setCameraError(err?.message || 'Gagal mengambil gambar dari kamera.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsCapturing(true);
    try {
      const result = await compressProofImage(file);
      stopStream();
      onCapture(result);
      onClose();
    } catch (err: any) {
      setCameraError(err?.message || 'Gagal memproses foto.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
      >
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">{title}</h4>
              <p className="text-[11px] text-slate-500">
                Arahkan kamera ke meteran PDAM &amp; nomor rumah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          ref={fallbackInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFallbackFile}
          className="hidden"
        />

        <div className="bg-slate-950 relative aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
          {isLoadingCamera && !cameraError && (
            <div className="text-white text-xs font-medium flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Mengaktifkan kamera...</span>
            </div>
          )}

          {cameraError ? (
            <div className="p-5 text-center space-y-3 text-slate-200">
              <AlertCircle className="w-9 h-9 text-amber-400 mx-auto" />
              <p className="text-xs leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => fallbackInputRef.current?.click()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ImagePlus className="w-4 h-4" />
                <span>Pilih Foto / Kamera Perangkat</span>
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isLoadingCamera ? 'opacity-0' : 'opacity-100'}`}
            />
          )}
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            disabled={Boolean(cameraError) || isLoadingCamera}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Putar</span>
          </button>

          <button
            type="button"
            onClick={handleTakeSnapshot}
            disabled={Boolean(cameraError) || isLoadingCamera || isCapturing}
            className="flex-1 py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isCapturing ? 'Menyimpan...' : 'Jepret Foto Sekarang'}</span>
          </button>

          <button
            type="button"
            onClick={() => fallbackInputRef.current?.click()}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            title="Pilih dari file/galeri"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
