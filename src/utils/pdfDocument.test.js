import fs from 'fs';
import path from 'path';
import { renderPdfBlob } from './pdfDocument';

// Exercises the real PDFKit pipeline: font embedding, image placement, page breaks.
describe('renderPdfBlob', () => {
    const fontDir = path.join(__dirname, '..', '..', 'public', 'fonts');
    // 1x1 white JPEG.
    const JPEG = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==',
        'base64'
    );

    const image = (number) => ({
        dataUrl: `data:image/jpeg;base64,${JPEG.toString('base64')}`,
        width: 345,
        height: 259,
        number
    });

    // Plain function, not jest.fn: CRA runs jest with resetMocks, which would strip the
    // implementation off a mock created once in beforeAll.
    beforeEach(() => {
        global.fetch = (url) => {
            const file = path.join(fontDir, path.basename(String(url)));
            // Must be built in this realm: pdfkit checks `src instanceof Uint8Array`, and a
            // Node Buffer belongs to a different realm than jsdom's globals, so it fails the
            // check and gets mistaken for an already-parsed font object.
            return Promise.resolve({ arrayBuffer: async () => new Uint8Array(fs.readFileSync(file)) });
        };
    });

    afterEach(() => { delete global.fetch; });

    // jsdom 16's Blob has no arrayBuffer(), so go through FileReader.
    const bytesOf = (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
    });

    it('produces a real PDF file', async () => {
        const blob = await renderPdfBlob({
            documentTitle: 'בדיקה',
            red: [image(1), image(2), image(3)],
            green: [],
            date: '04/08/2026'
        });

        expect(blob.type).toBe('application/pdf');
        const bytes = await bytesOf(blob);
        expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-');
        expect(bytes.length).toBeGreaterThan(1000);
    });

    it('embeds the Hebrew font rather than falling back to a glyphless standard font', async () => {
        const blob = await renderPdfBlob({
            documentTitle: 'בדיקה',
            red: [image(1)],
            green: [],
            date: '04/08/2026'
        });

        const text = Buffer.from(await bytesOf(blob)).toString('latin1');
        expect(text).toMatch(/NotoSansHebrew/);
    });

    it('starts the originals section on its own page', async () => {
        const oneSection = await renderPdfBlob({
            documentTitle: 'בדיקה', red: [image(1)], green: [], date: '04/08/2026'
        });
        const twoSections = await renderPdfBlob({
            documentTitle: 'בדיקה', red: [image(1)], green: [image(1)], date: '04/08/2026'
        });

        const countPages = async (blob) =>
            (Buffer.from(await bytesOf(blob)).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

        expect(await countPages(oneSection)).toBe(1);
        expect(await countPages(twoSections)).toBe(2);
    });
});
