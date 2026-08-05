import { processImage, fitInside, dataUrlToArrayBuffer } from './imageProcessing';
import { TABLE_CONSTANTS } from '../constants';

describe('fitInside', () => {
    it('scales a landscape photo down by width', () => {
        expect(fitInside(4000, 3000, 345, 350)).toEqual({ width: 345, height: 259 });
    });

    it('scales a portrait photo down by height', () => {
        expect(fitInside(3000, 4000, 345, 350)).toEqual({ width: 263, height: 350 });
    });

    it('never scales a small image up', () => {
        expect(fitInside(100, 80, 345, 350)).toEqual({ width: 100, height: 80 });
    });
});

describe('processImage', () => {
    let canvasSizes;
    const originalImage = global.Image;

    beforeEach(() => {
        canvasSizes = [];
        global.Image = class {
            constructor() { this.width = 4000; this.height = 3000; }
            set src(_v) { setTimeout(() => this.onload && this.onload()); }
        };
        HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, drawImage: () => {} });
        HTMLCanvasElement.prototype.toDataURL = function () {
            canvasSizes.push({ width: this.width, height: this.height });
            return 'data:image/jpeg;base64,YWJj';
        };
    });

    afterEach(() => { global.Image = originalImage; });

    it('rasterises at the placement size, not the camera resolution', async () => {
        const result = await processImage('data:image/png;base64,abc');

        // A 4000x3000 photo must not be embedded at 4000x3000 -- that is what bloated the file.
        expect(canvasSizes[0].width).toBeLessThan(4000);
        expect(result.width).toBe(TABLE_CONSTANTS.IMAGE_SIZE.maxWidth);
        expect(result.height).toBe(259);
    });

    it('rasterises above the placement size so print stays sharp', async () => {
        await processImage('data:image/png;base64,abc');

        // Placement is 345pt; rendering exactly 345px would look soft in print.
        expect(canvasSizes[0].width).toBeGreaterThan(TABLE_CONSTANTS.IMAGE_SIZE.maxWidth);
        expect(canvasSizes[0].width / TABLE_CONSTANTS.IMAGE_SIZE.maxWidth).toBe(2);
    });

    it('returns both a data URL and a buffer, for PDF and Word respectively', async () => {
        const result = await processImage('data:image/png;base64,abc');

        expect(result.dataUrl).toMatch(/^data:image\/jpeg;base64,/);
        expect(result.buffer).toBeInstanceOf(ArrayBuffer);
        expect(result.buffer.byteLength).toBeGreaterThan(0);
    });

    it('rejects a missing or malformed url', async () => {
        await expect(processImage(null)).rejects.toThrow('Invalid image URL format');
        await expect(processImage(123)).rejects.toThrow('Invalid image URL format');
    });

    it('rejects when the image cannot be loaded', async () => {
        global.Image = class {
            set src(_v) { setTimeout(() => this.onerror && this.onerror()); }
        };
        await expect(processImage('data:image/png;base64,abc')).rejects.toThrow('Could not load image');
    });
});

describe('dataUrlToArrayBuffer', () => {
    it('decodes base64 payloads', () => {
        const buffer = dataUrlToArrayBuffer('data:image/jpeg;base64,YWJj');
        expect(Array.from(new Uint8Array(buffer))).toEqual([97, 98, 99]);   // "abc"
    });
});
