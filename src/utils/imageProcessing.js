import { TABLE_CONSTANTS } from '../constants';

// Phone photos are ~4000px wide, but they are placed at ~345pt in the document. Rasterising at
// the original resolution embedded tens of megabytes that no renderer can ever show, so the
// canvas is sized to the placement size instead. RENDER_SCALE keeps it sharp in print: the
// document renders at 96dpi, so 2x lands around 192dpi.
const RENDER_SCALE = 2;
const JPEG_QUALITY = 0.9;

const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = url;
});

// Largest size that fits the box while preserving the aspect ratio. Never scales up.
export const fitInside = (width, height, maxWidth, maxHeight) => {
    if (!width || !height) return { width: maxWidth, height: maxHeight };
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    return {
        width: Math.max(1, Math.round(width * ratio)),
        height: Math.max(1, Math.round(height * ratio))
    };
};

export const processImage = async (imageUrl, options = {}) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid image URL format');
    }

    const maxWidth = options.maxWidth ?? TABLE_CONSTANTS.IMAGE_SIZE.maxWidth;
    const maxHeight = options.maxHeight ?? TABLE_CONSTANTS.IMAGE_SIZE.maxHeight;

    const img = await loadImage(imageUrl);
    const { width, height } = fitInside(img.width, img.height, maxWidth, maxHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width * RENDER_SCALE;
    canvas.height = height * RENDER_SCALE;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get a drawing context');
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';

    // White background first, so transparent PNGs do not come out black in JPEG.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

    return {
        dataUrl,
        buffer: dataUrlToArrayBuffer(dataUrl),
        // Placement size in points; the pixel buffer behind it is RENDER_SCALE times larger.
        width,
        height
    };
};

export const dataUrlToArrayBuffer = (dataUrl) => {
    const base64 = dataUrl.split(';base64,').pop();
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};
