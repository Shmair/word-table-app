import PDFDocument from '@react-pdf/pdfkit';
import { TABLE_CONSTANTS, TABLE_LABELS, TABLE_TYPE } from '../constants';
import { numberToHebrewLetter } from './hebrewNumbers';
import { toVisualOrder } from './bidi';

// The Word layout is in twips (1/1440"), PDF works in points (1/72").
const pt = (twips) => twips / 20;
// Image sizes are CSS pixels at 96dpi.
const pxToPt = (px) => (px * 72) / 96;
// docx border sizes are in eighths of a point.
const borderWidth = TABLE_CONSTANTS.BORDER_SIZE / 8;

const FONT_REGULAR = 'hebrew';
const FONT_BOLD = 'hebrew-bold';

const fontUrl = (file) => `${process.env.PUBLIC_URL || ''}/fonts/${file}`;

// The PDF standard fonts carry no Hebrew glyphs, so a font has to be embedded or every Hebrew
// character renders blank. Bundled with the app so exporting works offline.
const loadFonts = async () => {
    const [regular, bold] = await Promise.all([
        fetch(fontUrl('NotoSansHebrew-Regular.ttf')).then((r) => r.arrayBuffer()),
        fetch(fontUrl('NotoSansHebrew-Bold.ttf')).then((r) => r.arrayBuffer())
    ]);
    return { regular, bold };
};

const labelFor = (image, index, tableType) => (
    tableType === TABLE_TYPE.RED
        ? numberToHebrewLetter(image.number || index + 1)
        : `#${image.number || index + 1}`
);

// Draws `text` centred on the page, returns the y position just below it.
const centredText = (doc, text, y, { size, color = '#000000', bold = false }) => {
    doc.font(bold ? FONT_BOLD : FONT_REGULAR).fontSize(size).fillColor(color);
    doc.text(toVisualOrder(text), doc.page.margins.left, y, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: 'center',
        lineBreak: false
    });
    return y + doc.currentLineHeight() + 2;
};

const drawSection = (doc, { label, color, images, tableType, startY }) => {
    const pageWidth = doc.page.width;
    const contentLeft = doc.page.margins.left;
    const contentBottom = doc.page.height - doc.page.margins.bottom;

    const cellWidth = pt(TABLE_CONSTANTS.CELL_WIDTH);
    const cellHeight = pt(TABLE_CONSTANTS.CELL_HEIGHT);
    const tableWidth = pt(TABLE_CONSTANTS.TABLE_WIDTH);
    const tableLeft = contentLeft + (pageWidth - contentLeft - doc.page.margins.right - tableWidth) / 2;

    let y = centredText(doc, label, startY, {
        size: TABLE_CONSTANTS.HEADING_FONT_SIZE / 2,
        color: `#${color}`,
        bold: true
    });
    y += pt(TABLE_CONSTANTS.SPACING.HEADING_AFTER);

    for (let i = 0; i < images.length; i += TABLE_CONSTANTS.CELLS_PER_ROW) {
        const row = images.slice(i, i + TABLE_CONSTANTS.CELLS_PER_ROW);

        if (y + cellHeight > contentBottom) {
            doc.addPage();
            y = doc.page.margins.top;
        }

        // A short row is centred rather than left hanging on one side, as in the Word export.
        const rowWidth = row.length * cellWidth;
        const rowLeft = tableLeft + (tableWidth - rowWidth) / 2;

        row.forEach((image, j) => {
            // Right to left: the first signature sits in the rightmost column.
            const x = rowLeft + rowWidth - (j + 1) * cellWidth;

            doc.lineWidth(borderWidth).strokeColor(`#${color}`).rect(x, y, cellWidth, cellHeight).stroke();

            const imgWidth = pxToPt(image.width);
            const imgHeight = pxToPt(image.height);
            const labelHeight = TABLE_CONSTANTS.FONT_SIZE / 2 + pt(TABLE_CONSTANTS.SPACING.NUMBER_BEFORE);
            // Centre image + label together inside the cell.
            const blockTop = y + (cellHeight - imgHeight - labelHeight) / 2;

            // Pass the data URL, not a Uint8Array: PDFImage.open only recognises Buffer,
            // ArrayBuffer or a base64 data URL, and anything else is treated as a file path.
            doc.image(image.dataUrl, x + (cellWidth - imgWidth) / 2, blockTop, {
                width: imgWidth,
                height: imgHeight
            });

            doc.font(FONT_BOLD).fontSize(TABLE_CONSTANTS.FONT_SIZE / 2).fillColor('#000000');
            doc.text(
                toVisualOrder(labelFor(image, i + j, tableType)),
                x,
                blockTop + imgHeight + pt(TABLE_CONSTANTS.SPACING.NUMBER_BEFORE),
                { width: cellWidth, align: 'center', lineBreak: false }
            );
        });

        y += cellHeight;
    }

    return y;
};

const addPageNumbers = (doc) => {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        doc.font(FONT_REGULAR).fontSize(TABLE_CONSTANTS.FONT_SIZE / 2).fillColor('#000000');

        // The footer sits inside the bottom margin, and PDFKit starts a new page as soon as
        // text crosses that boundary -- which appended a blank page to every export. Dropping
        // the margin for the duration of the write keeps the footer on its own page.
        const bottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc.text(`-${i + 1}-`, doc.page.margins.left, doc.page.height - bottomMargin + 8, {
            width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
            align: 'center',
            lineBreak: false
        });
        doc.page.margins.bottom = bottomMargin;
    }
};

// `green`/`red` carry processed images: { dataUrl, width, height, number }.
export const renderPdfBlob = async ({ documentTitle, green = [], red = [], date }) => {
    const fonts = await loadFonts();
    const margin = pt(TABLE_CONSTANTS.PAGE_MARGIN);

    const doc = new PDFDocument({ size: 'A4', margin, bufferPages: true });
    doc.registerFont(FONT_REGULAR, fonts.regular);
    doc.registerFont(FONT_BOLD, fonts.bold);

    const chunks = [];
    const done = new Promise((resolve, reject) => {
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(new Blob(chunks, { type: 'application/pdf' })));
        doc.on('error', reject);
    });

    doc.font(FONT_REGULAR).fontSize(TABLE_CONSTANTS.FONT_SIZE / 2).fillColor('#000000');
    doc.text(date, margin, margin, { lineBreak: false });

    let y = centredText(doc, documentTitle || 'Tables Export', margin + doc.currentLineHeight() + pt(TABLE_CONSTANTS.SPACING.DATE_AFTER), {
        size: TABLE_CONSTANTS.TITLE_FONT_SIZE / 2,
        bold: true
    });
    y += pt(TABLE_CONSTANTS.SPACING.TITLE_AFTER);

    if (red.length) {
        y = drawSection(doc, {
            label: TABLE_LABELS.DISPUTED_SIGNATURES,
            color: TABLE_CONSTANTS.COLORS.RED,
            images: red,
            tableType: TABLE_TYPE.RED,
            startY: y
        });
    }

    if (green.length) {
        // Each signatures section starts on its own page, even if the previous one is short.
        if (red.length) {
            doc.addPage();
            y = doc.page.margins.top;
        }
        drawSection(doc, {
            label: TABLE_LABELS.ORIGINAL_SIGNATURES,
            color: TABLE_CONSTANTS.COLORS.GREEN,
            images: green,
            tableType: TABLE_TYPE.GREEN,
            startY: y
        });
    }

    addPageNumbers(doc);
    doc.end();
    return done;
};
