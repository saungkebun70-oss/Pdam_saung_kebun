/**
 * Kompres foto bukti pemasangan meteran PDAM di sisi klien (browser)
 * agar ukuran file selalu kecil (< 185 KB) dan cepat dimuat di HP maupun Cloud Firestore.
 */

export function compressSourceToProof(
  source: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  mirrorHorizontal = false
): { dataUrl: string; sizeKb: number } {
  const renderCompressed = (maxDim: number, quality: number): string => {
    let width = naturalWidth;
    let height = naturalHeight;

    if (width > maxDim || height > maxDim) {
      if (width >= height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser tidak mendukung pemrosesan foto.');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mirrorHorizontal) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/jpeg', quality);
  };

  const attempts: Array<[number, number]> = [
    [760, 0.72],
    [640, 0.6],
    [540, 0.5],
    [440, 0.42],
  ];

  let dataUrl = '';
  for (const [maxDim, quality] of attempts) {
    dataUrl = renderCompressed(maxDim, quality);
    if (dataUrl.length <= 185000) {
      break;
    }
  }

  if (dataUrl.length > 240000) {
    throw new Error('Ukuran foto terlalu besar setelah kompresi. Silakan ambil foto yang lebih ringkas.');
  }

  const sizeKb = Math.max(1, Math.round((dataUrl.length * 3) / 4 / 1024));
  return { dataUrl, sizeKb };
}

export async function compressProofImage(
  file: File
): Promise<{ dataUrl: string; sizeKb: number }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar/foto (JPG, PNG, WEBP).');
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal membaca file foto. Coba pilih foto lain.'));
      el.src = imageUrl;
    });

    return compressSourceToProof(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
