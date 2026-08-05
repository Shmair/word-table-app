import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WordExport from './WordExport';

// Mock docx to avoid bundling and canvas dependencies
jest.mock('docx', () => ({
    Document: jest.fn(),
    Footer: jest.fn(),
    Packer: {
        toBlob: jest.fn().mockResolvedValue(new Blob(['mock'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
    },
    Paragraph: jest.fn(),
    Table: jest.fn(),
    TableRow: jest.fn(),
    TableCell: jest.fn(),
    TableLayoutType: { FIXED: 'fixed' },
    HeightRule: { AUTO: 'auto', ATLEAST: 'atLeast', EXACT: 'exact' },
    WidthType: { DXA: 'dxa' },
    TextRun: jest.fn(),
    ImageRun: jest.fn(),
    AlignmentType: { CENTER: 'center' },
    PageNumber: { CURRENT: 'current' }
}));

// @react-pdf/renderer pulls in a full PDF engine; the component only needs to route to it.
jest.mock('../utils/pdfDocument', () => ({
    renderPdfBlob: jest.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
}));

describe('WordExport', () => {
    const { Packer } = require('docx');
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;
    const originalImage = global.Image;
    let anchorClick;

    beforeEach(() => {
        // CRA runs jest with resetMocks: true, which clears mock implementations (not just
        // calls) before every test -- including the one declared in jest.mock above. Without
        // re-arming it, Packer.toBlob resolves undefined and the export blows up on blob.size.
        require('docx').Packer.toBlob.mockResolvedValue(
            new Blob(['mock'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        );
        window.URL.createObjectURL = jest.fn(() => 'blob:mock');
        window.URL.revokeObjectURL = jest.fn();
        window.alert = jest.fn();
        // Saving falls back to a download, and jsdom has no navigation to follow the anchor.
        anchorClick = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        // jsdom neither loads images nor rasterises canvases. Without stand-ins, any export
        // rejects after the test body has finished and logs an error nobody is watching.
        global.Image = class {
            constructor() { this.width = 100; this.height = 100; }
            set src(_v) { setTimeout(() => this.onload && this.onload()); }
        };
        HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, drawImage: () => {} });
        HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,YWJj';
    });

    afterEach(() => {
        window.URL.createObjectURL = originalCreateObjectURL;
        window.URL.revokeObjectURL = originalRevokeObjectURL;
        global.Image = originalImage;
        anchorClick.mockRestore();
    });

    it('renders document title input', () => {
        render(<WordExport greenTableData={[]} redTableData={[]} />);
        expect(screen.getByPlaceholderText('שם המסמך')).toBeInTheDocument();
    });

    it('renders export button', () => {
        render(<WordExport greenTableData={[]} redTableData={[]} />);
        expect(screen.getByRole('button', { name: /ייצוא/ })).toBeInTheDocument();
    });

    it('shows MISSING_TITLE in button title when no document title', () => {
        const { EXPORT_MESSAGES } = require('../constants');
        render(<WordExport greenTableData={[{ url: 'x', number: 1 }]} redTableData={[{ url: 'y', number: 1 }]} />);
        const btn = screen.getByRole('button', { name: /ייצוא/ });
        expect(btn).toHaveAttribute('title', EXPORT_MESSAGES.MISSING_TITLE);
    });

    it('shows MISSING_IMAGES in button title when both tables empty', () => {
        const { EXPORT_MESSAGES } = require('../constants');
        render(<WordExport greenTableData={[]} redTableData={[]} />);
        fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test' } });
        const btn = screen.getByRole('button', { name: /ייצוא/ });
        expect(btn).toHaveAttribute('title', EXPORT_MESSAGES.MISSING_IMAGES);
    });

    it('shows MISSING_IMAGES when export clicked with both tables empty', () => {
        const { EXPORT_MESSAGES } = require('../constants');
        render(<WordExport greenTableData={[]} redTableData={[]} />);
        fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test Doc' } });
        fireEvent.click(screen.getByRole('button', { name: /ייצוא/ }));

        expect(window.alert).toHaveBeenCalledWith(EXPORT_MESSAGES.MISSING_IMAGES);
    });

    it('allows export with only green table filled', async () => {
        render(
            <WordExport
                greenTableData={[{ url: 'data:image/png;base64,abc', number: 1 }]}
                redTableData={[]}
            />
        );
        fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test' } });
        fireEvent.click(screen.getByRole('button', { name: /ייצוא/ }));

        await waitFor(() => expect(Packer.toBlob).toHaveBeenCalled());
        expect(window.alert).not.toHaveBeenCalled();
    });

    it('allows export with only red table filled', async () => {
        render(
            <WordExport
                greenTableData={[]}
                redTableData={[{ url: 'data:image/png;base64,abc', number: 1 }]}
            />
        );
        fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test' } });
        fireEvent.click(screen.getByRole('button', { name: /ייצוא/ }));

        await waitFor(() => expect(Packer.toBlob).toHaveBeenCalled());
        expect(window.alert).not.toHaveBeenCalled();
    });

    describe('saving', () => {
        const img = () => ({ url: 'data:image/png;base64,abc', number: 1 });

        const exportAs = async (title) => {
            render(<WordExport greenTableData={[img()]} redTableData={[]} />);
            fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: title } });
            fireEvent.click(screen.getByRole('button', { name: /ייצוא/ }));
            await waitFor(() => expect(anchorClick).toHaveBeenCalled());
            return anchorClick.mock.instances[0].download;
        };

        it('names the file after the document title and the date', async () => {
            const name = await exportAs('חוות דעת');
            expect(name).toMatch(/^חוות-דעת-\d{4}-\d{2}-\d{2}\.docx$/);
        });

        it('strips characters that are illegal in a filename', async () => {
            const name = await exportAs('a/b:c*d?e"f<g>h|i');
            expect(name).toMatch(/^abcdefghi-\d{4}-\d{2}-\d{2}\.docx$/);
        });

        it('falls back to a usable name when the title is only punctuation', async () => {
            const name = await exportAs('///');
            expect(name).toMatch(/^export-\d{4}-\d{2}-\d{2}\.docx$/);
        });

        it('releases the object URL it created', async () => {
            await exportAs('Test');
            await waitFor(() => expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock'));
        });
    });

    describe('document title', () => {
        const { TITLE_STORAGE_KEY } = require('../constants');

        beforeEach(() => localStorage.clear());
        afterEach(() => localStorage.clear());

        it('survives a refresh', () => {
            const { unmount } = render(<WordExport greenTableData={[]} redTableData={[]} />);
            fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'חוות דעת' } });
            unmount();

            render(<WordExport greenTableData={[]} redTableData={[]} />);
            expect(screen.getByPlaceholderText('שם המסמך')).toHaveValue('חוות דעת');
        });

        it('forgets the title once it is cleared', () => {
            localStorage.setItem(TITLE_STORAGE_KEY, 'ישן');
            const { unmount } = render(<WordExport greenTableData={[]} redTableData={[]} />);
            fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: '' } });
            unmount();

            expect(localStorage.getItem(TITLE_STORAGE_KEY)).toBeNull();
            render(<WordExport greenTableData={[]} redTableData={[]} />);
            expect(screen.getByPlaceholderText('שם המסמך')).toHaveValue('');
        });
    });

    describe('format choice', () => {
        const { EXPORT_FORMAT } = require('../constants');
        const img = () => ({ url: 'data:image/png;base64,abc', number: 1 });

        const exportWithFormat = async (formatValue) => {
            render(<WordExport greenTableData={[img()]} redTableData={[img()]} />);
            fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test' } });
            fireEvent.change(screen.getByLabelText('פורמט הייצוא'), { target: { value: formatValue } });
            fireEvent.click(screen.getByRole('button', { name: /ייצוא/ }));
            await waitFor(() => expect(anchorClick).toHaveBeenCalled());
            return anchorClick.mock.instances[0].download;
        };

        it('offers both formats and defaults to Word', () => {
            render(<WordExport greenTableData={[]} redTableData={[]} />);
            const select = screen.getByLabelText('פורמט הייצוא');
            expect(select).toHaveValue(EXPORT_FORMAT.DOCX);
            expect(Array.from(select.options).map((o) => o.value))
                .toEqual([EXPORT_FORMAT.DOCX, EXPORT_FORMAT.PDF]);
        });

        it('builds a docx through the docx packer', async () => {
            const name = await exportWithFormat(EXPORT_FORMAT.DOCX);

            expect(name).toMatch(/\.docx$/);
            expect(Packer.toBlob).toHaveBeenCalled();
        });

        it('builds a pdf through the pdf renderer, not the docx packer', async () => {
            const { renderPdfBlob } = require('../utils/pdfDocument');
            renderPdfBlob.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));

            const name = await exportWithFormat(EXPORT_FORMAT.PDF);

            expect(name).toMatch(/\.pdf$/);
            expect(Packer.toBlob).not.toHaveBeenCalled();
            expect(renderPdfBlob).toHaveBeenCalledTimes(1);
        });

        it('hands the pdf renderer processed images with both tables and a title', async () => {
            const { renderPdfBlob } = require('../utils/pdfDocument');
            renderPdfBlob.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));

            await exportWithFormat(EXPORT_FORMAT.PDF);

            const props = renderPdfBlob.mock.calls[0][0];
            expect(props.documentTitle).toBe('Test');
            expect(props.green).toHaveLength(1);
            expect(props.red).toHaveLength(1);
            // Processed, not raw: react-pdf needs a rasterised data URL plus placement size.
            expect(props.green[0].dataUrl).toMatch(/^data:image\/jpeg;base64,/);
            expect(props.green[0]).toMatchObject({ number: 1, width: expect.any(Number), height: expect.any(Number) });
        });
    });

    describe('sections', () => {
        const { Packer, Paragraph, TextRun } = require('docx');
        const { TABLE_CONSTANTS, TABLE_LABELS } = require('../constants');
        const img = (n) => ({ url: 'data:image/png;base64,abc', number: n });

        let originalImage;
        beforeEach(() => {
            originalImage = global.Image;
            global.Image = class {
                constructor() { this.width = 100; this.height = 100; }
                set src(_v) { setTimeout(() => this.onload && this.onload()); }
            };
            HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, drawImage: () => {} });
            HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,YWJj';
            Paragraph.mockClear();
            TextRun.mockClear();
        });
        afterEach(() => { global.Image = originalImage; });

        const exportBoth = async (green, red) => {
            render(<WordExport greenTableData={green} redTableData={red} />);
            fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test' } });
            fireEvent.click(screen.getByRole('button', { name: /ייצוא/ }));
            await waitFor(() => expect(Packer.toBlob).toHaveBeenCalled());
        };

        const headingFor = (label) => {
            const runIndex = TextRun.mock.calls.findIndex((c) => c[0].text === label);
            const run = TextRun.mock.instances[runIndex];
            return Paragraph.mock.calls.find((c) => c[0].children?.includes(run))?.[0];
        };

        it('colours each section heading and starts originals on a fresh page', async () => {
            await exportBoth([img(1)], [img(1)]);

            const disputed = TextRun.mock.calls.find((c) => c[0].text === TABLE_LABELS.DISPUTED_SIGNATURES)[0];
            const originals = TextRun.mock.calls.find((c) => c[0].text === TABLE_LABELS.ORIGINAL_SIGNATURES)[0];
            expect(disputed.color).toBe(TABLE_CONSTANTS.COLORS.RED);
            expect(originals.color).toBe(TABLE_CONSTANTS.COLORS.GREEN);

            // Each signatures section gets its own page, even when the previous one is short.
            expect(headingFor(TABLE_LABELS.ORIGINAL_SIGNATURES).pageBreakBefore).toBe(true);
        });

        it('does not break to a second page when there is only one section', async () => {
            await exportBoth([img(1)], []);

            expect(headingFor(TABLE_LABELS.ORIGINAL_SIGNATURES).pageBreakBefore).toBe(false);
        });
    });

    describe('row layout', () => {
        const { Packer, TableRow, TableCell } = require('docx');
        const { TABLE_CONSTANTS } = require('../constants');
        const img = (n) => ({ url: 'data:image/png;base64,abc', number: n });

        // jsdom neither loads images nor rasterises canvases, so stand both in.
        let originalImage;
        beforeEach(() => {
            originalImage = global.Image;
            global.Image = class {
                constructor() { this.width = 100; this.height = 100; }
                set src(_v) { setTimeout(() => this.onload && this.onload()); }
            };
            HTMLCanvasElement.prototype.getContext = () => ({ fillRect: () => {}, drawImage: () => {} });
            HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,YWJj';
            TableRow.mockClear();
            TableCell.mockClear();
        });
        afterEach(() => { global.Image = originalImage; });

        const exportWith = async (redTableData) => {
            render(<WordExport greenTableData={[]} redTableData={redTableData} />);
            fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test' } });
            fireEvent.click(screen.getByRole('button', { name: /ייצוא/ }));
            await waitFor(() => expect(Packer.toBlob).toHaveBeenCalled());
        };

        it('centres a lone image by padding the row on both sides', async () => {
            await exportWith([img(1), img(2), img(3)]);

            const rows = TableRow.mock.calls.map((c) => c[0].children);
            expect(rows).toHaveLength(2);

            // full row: two image cells, no padding
            expect(rows[0]).toHaveLength(TABLE_CONSTANTS.CELLS_PER_ROW);

            // short row: spacer, image, spacer -- equal padding either side
            const short = rows[1];
            expect(short).toHaveLength(3);
            const spans = short.map((cell) => TableCell.mock.calls[TableCell.mock.instances.indexOf(cell)][0].columnSpan);
            expect(spans).toEqual([1, 2, 1]);
        });

        it('sets the height on the row, where docx actually reads it', async () => {
            await exportWith([img(1), img(2)]);

            // TableCell has no height option -- setting it there is silently dropped and the
            // rows collapse onto their content instead of filling the page.
            const rowOptions = TableRow.mock.calls[0][0];
            expect(rowOptions.height).toEqual({
                value: TABLE_CONSTANTS.CELL_HEIGHT,
                rule: 'atLeast'
            });
            TableCell.mock.calls.forEach(([options]) => {
                expect(options).not.toHaveProperty('height');
            });
        });

        it('puts layout options where docx reads them, not in a nested bag it ignores', async () => {
            const { Table } = require('docx');
            Table.mockClear();
            await exportWith([img(1), img(2)]);

            const table = Table.mock.calls[0][0];
            // `tableProperties` is not part of ITableOptions -- anything nested there is
            // dropped, which left the table narrow and left-aligned.
            expect(table).not.toHaveProperty('tableProperties');
            expect(table.alignment).toBe('center');
            expect(table.layout).toBe('fixed');
            expect(table.width).toEqual({ size: TABLE_CONSTANTS.TABLE_WIDTH, type: 'dxa' });
            expect(table.borders).toBeDefined();
            expect(table.margins).toEqual({
                top: TABLE_CONSTANTS.MARGINS.TOP,
                bottom: TABLE_CONSTANTS.MARGINS.BOTTOM,
                right: TABLE_CONSTANTS.MARGINS.RIGHT,
                left: TABLE_CONSTANTS.MARGINS.LEFT
            });
        });

        it('declares a column grid that adds up to the table width', async () => {
            const { Table } = require('docx');
            Table.mockClear();
            await exportWith([img(1), img(2)]);

            const { columnWidths } = Table.mock.calls[0][0];
            expect(columnWidths).toHaveLength(TABLE_CONSTANTS.CELLS_PER_ROW * 2);
            expect(columnWidths.reduce((a, b) => a + b, 0)).toBe(TABLE_CONSTANTS.TABLE_WIDTH);
        });

        it('leaves an even row unpadded', async () => {
            await exportWith([img(1), img(2)]);

            const rows = TableRow.mock.calls.map((c) => c[0].children);
            expect(rows).toHaveLength(1);
            expect(rows[0]).toHaveLength(TABLE_CONSTANTS.CELLS_PER_ROW);
        });
    });
});
