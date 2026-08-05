import { AlignmentType, Document, Footer, HeightRule, ImageRun, Packer, Paragraph, PageNumber, Table, TableCell, TableLayoutType, TableRow, TextRun, WidthType } from 'docx';
import { useEffect, useState } from 'react';
import { TABLE_CONSTANTS, TABLE_TYPE, TABLE_LABELS, EXPORT_MESSAGES, LANG_HEBREW, EXPORT_FORMAT, EXPORT_FORMAT_LABELS } from '../constants';
import { numberToHebrewLetter } from '../utils/hebrewNumbers';
import { processImage } from '../utils/imageProcessing';
import { readDocumentTitle, saveDocumentTitle } from '../utils/imageStore';

// Fixed grid of half-width columns, so every column keeps the same width regardless of its
// content. Image cells span two of them; a partly filled row pads with single half-columns.
const COLUMN_WIDTHS = Array(TABLE_CONSTANTS.CELLS_PER_ROW * 2).fill(TABLE_CONSTANTS.CELL_WIDTH / 2);

const WordExport = ({ greenTableData, redTableData }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [format, setFormat] = useState(EXPORT_FORMAT.DOCX);
    const [documentTitle, setDocumentTitle] = useState(readDocumentTitle);
    const [destinationDirHandle, setDestinationDirHandle] = useState(null);
    const [destinationFolderName, setDestinationFolderName] = useState('');

    const supportsDestinationFolder = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    useEffect(() => {
        saveDocumentTitle(documentTitle);
    }, [documentTitle]);

    const handleChooseDestinationFolder = async () => {
        try {
            const handle = await window.showDirectoryPicker();
            setDestinationDirHandle(handle);
            setDestinationFolderName(handle.name);
        } catch (e) {
            if (e.name !== 'AbortError') {
                alert('Could not select folder: ' + (e.message || 'Permission denied'));
            }
        }
    };

    const createTableRows = async (data, color) => {
        const rows = [];
        const colorHex = color === TABLE_TYPE.GREEN ? TABLE_CONSTANTS.COLORS.GREEN : TABLE_CONSTANTS.COLORS.RED;

        // Height belongs to the row, not the cell -- TableCell has no height option at all, so
        // setting it there is silently dropped and rows collapse onto their content.
        const rowHeight = { value: TABLE_CONSTANTS.CELL_HEIGHT, rule: HeightRule.ATLEAST };

        // Blank spacer occupying `columnSpan` half-columns of the grid; used to pad a partly
        // filled row on both sides so its images stay centred instead of hugging one edge.
        const spacerCell = (columnSpan) => new TableCell({
            children: [new Paragraph({ text: '' })],
            columnSpan,
            borders: { top: { style: 'nil', size: 0 }, bottom: { style: 'nil', size: 0 }, left: { style: 'nil', size: 0 }, right: { style: 'nil', size: 0 } },
            width: { size: (TABLE_CONSTANTS.CELL_WIDTH / 2) * columnSpan, type: WidthType.DXA },
            verticalAlign: 'center'
        });

        if (!data?.length) {
            rows.push(new TableRow({ children: [spacerCell(2), spacerCell(2)], height: rowHeight, cantSplit: true }));
            return rows;
        }

        for (let i = 0; i < data.length; i += TABLE_CONSTANTS.CELLS_PER_ROW) {
            const rowData = data.slice(i, i + TABLE_CONSTANTS.CELLS_PER_ROW).filter((d) => d?.url);
            const cells = [];

            for (let j = 0; j < rowData.length; j++) {
                const imageData = rowData[j];

                try {
                    const processedImage = await processImage(imageData.url);
                    cells.push(
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            type: 'jpg',
                                            data: processedImage.buffer,
                                            transformation: {
                                                width: processedImage.width,
                                                height: processedImage.height
                                            },
                                            altText: {
                                                title: `image-${i}-${j}`,
                                                description: `Image ${i}-${j}`,
                                                name: `image-${i}-${j}`
                                            }
                                        })
                                    ],
                                    spacing: {
                                        before: TABLE_CONSTANTS.SPACING.IMAGE_BEFORE,
                                        after: TABLE_CONSTANTS.SPACING.IMAGE_AFTER
                                    },
                                    alignment: 'center'
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: color === TABLE_TYPE.RED
                                                ? numberToHebrewLetter(imageData.number || i + j + 1)
                                                : '#' + (imageData.number || i + j + 1),
                                            bold: true,
                                            size: TABLE_CONSTANTS.FONT_SIZE,
                                            language: LANG_HEBREW
                                        })
                                    ],
                                    alignment: 'center',
                                    spacing: { before: TABLE_CONSTANTS.SPACING.NUMBER_BEFORE, after: TABLE_CONSTANTS.SPACING.NUMBER_AFTER }
                                })
                            ],
                            borders: {
                                top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex }
                            },
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            columnSpan: 2,
                            verticalAlign: 'center'
                        })
                    );
                } catch (error) {
                    console.error('Error processing image in cell:', error);
                    cells.push(
                        new TableCell({
                            children: [new Paragraph({ text: 'Image error' })],
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            columnSpan: 2,
                            verticalAlign: 'center'
                        })
                    );
                }
            }

            if (!cells.length) continue;

            // Each image cell spans 2 half-columns, so a short row leaves an even number of
            // half-columns over -> split them evenly to left and right of the images.
            const spareHalves = (TABLE_CONSTANTS.CELLS_PER_ROW - cells.length) * 2;
            const children = cells.reverse();
            if (spareHalves > 0) {
                children.unshift(spacerCell(spareHalves / 2));
                children.push(spacerCell(spareHalves / 2));
            }

            rows.push(new TableRow({ children, height: rowHeight, cantSplit: true }));
        }
        return rows;
    };

    const hasTitle = !!documentTitle?.trim();
    const hasGreenImages = !!greenTableData?.length;
    const hasRedImages = !!redTableData?.length;
    const hasAnyImages = hasGreenImages || hasRedImages;
    const canExport = hasTitle && hasAnyImages;

    const getDisabledMessage = () => {
        if (!hasTitle) return EXPORT_MESSAGES.MISSING_TITLE;
        if (!hasAnyImages) return EXPORT_MESSAGES.MISSING_IMAGES;
        return '';
    };

    // Both formats lay out from the same constants, so they stay in step with each other.
    const buildPdfBlob = async () => {
        const { renderPdfBlob } = await import('../utils/pdfDocument');
        const prepare = async (images) => Promise.all((images || [])
            .filter((image) => image?.url)
            .map(async (image) => ({ ...(await processImage(image.url)), number: image.number })));

        return renderPdfBlob({
            documentTitle,
            green: await prepare(greenTableData),
            red: await prepare(redTableData),
            date: new Date().toLocaleDateString('en-GB')
        });
    };

    const buildDocxBlob = async () => {
        const sectionChildren = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: new Date().toLocaleDateString('en-GB'),
                        size: TABLE_CONSTANTS.FONT_SIZE
                    })
                ],
                spacing: { after: TABLE_CONSTANTS.SPACING.DATE_AFTER }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: documentTitle || 'Tables Export',
                        bold: true,
                        size: TABLE_CONSTANTS.TITLE_FONT_SIZE,
                        language: LANG_HEBREW
                    })
                ],
                alignment: 'center',
                spacing: { after: TABLE_CONSTANTS.SPACING.TITLE_AFTER }
            })
        ];

        if (redTableData?.length) {
            sectionChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: TABLE_LABELS.DISPUTED_SIGNATURES,
                            size: TABLE_CONSTANTS.HEADING_FONT_SIZE,
                            color: TABLE_CONSTANTS.COLORS.RED,
                            bold: true,
                            language: LANG_HEBREW
                        })
                    ],
                    alignment: 'center',
                    spacing: { before: TABLE_CONSTANTS.SPACING.HEADING_BEFORE, after: TABLE_CONSTANTS.SPACING.HEADING_AFTER }
                })
            );
            sectionChildren.push(new Table({
                rows: await createTableRows(redTableData, TABLE_TYPE.RED),
                width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                columnWidths: COLUMN_WIDTHS,
                layout: TableLayoutType.FIXED,
                alignment: AlignmentType.CENTER,
                margins: {
                    top: TABLE_CONSTANTS.MARGINS.TOP,
                    bottom: TABLE_CONSTANTS.MARGINS.BOTTOM,
                    right: TABLE_CONSTANTS.MARGINS.RIGHT,
                    left: TABLE_CONSTANTS.MARGINS.LEFT
                },
                borders: {
                    top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                    bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                    left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                    right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                    insideHorizontal: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                    insideVertical: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED }
                }
            }));
        }

        if (greenTableData?.length) {
            sectionChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: TABLE_LABELS.ORIGINAL_SIGNATURES,
                            size: TABLE_CONSTANTS.HEADING_FONT_SIZE,
                            color: TABLE_CONSTANTS.COLORS.GREEN,
                            bold: true,
                            language: LANG_HEBREW
                        })
                    ],
                    alignment: 'center',
                    // each signatures section starts on its own page, even if the previous one is half empty
                    pageBreakBefore: !!redTableData?.length,
                    spacing: { before: TABLE_CONSTANTS.SPACING.HEADING_BEFORE, after: TABLE_CONSTANTS.SPACING.HEADING_AFTER }
                })
            );
            sectionChildren.push(new Table({
                rows: await createTableRows(greenTableData, TABLE_TYPE.GREEN),
                width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                columnWidths: COLUMN_WIDTHS,
                layout: TableLayoutType.FIXED,
                alignment: AlignmentType.CENTER,
                margins: {
                    top: TABLE_CONSTANTS.MARGINS.TOP,
                    bottom: TABLE_CONSTANTS.MARGINS.BOTTOM,
                    right: TABLE_CONSTANTS.MARGINS.RIGHT,
                    left: TABLE_CONSTANTS.MARGINS.LEFT
                },
                borders: {
                    top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                    bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                    left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                    right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                    insideHorizontal: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                    insideVertical: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN }
                }
            }));
        }

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: TABLE_CONSTANTS.PAGE_MARGIN,
                            right: TABLE_CONSTANTS.PAGE_MARGIN,
                            bottom: TABLE_CONSTANTS.PAGE_MARGIN,
                            left: TABLE_CONSTANTS.PAGE_MARGIN
                        }
                    }
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        children: ['-', PageNumber.CURRENT, '-'],
                                        size: TABLE_CONSTANTS.FONT_SIZE
                                    })
                                ]
                            })
                        ]
                    })
                },
                children: sectionChildren
            }]
        });

        // Create blob directly in browser environment
        return Packer.toBlob(doc);
    };

    const exportDocument = async () => {
        if (isExporting) return;
        if (!canExport) {
            alert(getDisabledMessage());
            return;
        }

        try {
            setIsExporting(true);

            const blob = format === EXPORT_FORMAT.PDF ? await buildPdfBlob() : await buildDocxBlob();

            const date = new Date().toISOString().split('T')[0];
            const rawTitle = (documentTitle || 'tables-export').trim();
            const safeTitle = rawTitle
                .replace(/[\\/:*?"<>|]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || 'export';
            const fileName = `${safeTitle}-${date}.${format}`;

            const triggerDownload = () => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 0);
            };

            try {
                if (destinationDirHandle) {
                    try {
                        const fileHandle = await destinationDirHandle.getFileHandle(fileName, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                    } catch (folderError) {
                        console.warn('Folder save failed, falling back to download:', folderError);
                        triggerDownload();
                    }
                } else {
                    triggerDownload();
                }
            } catch (saveError) {
                throw new Error(saveError?.message || 'Could not save the file');
            }
        } catch (error) {
            console.error('Error details:', error);
            let errorMessage = `Error creating ${format.toUpperCase()} document: `;
            if (error?.message?.includes('base64')) {
                errorMessage += 'Invalid image data';
            } else if (error?.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Unknown error occurred';
            }
            alert(errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <span className="toolbar-divider" aria-hidden />
            <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="שם המסמך"
                style={{ minWidth: 160 }}
            />
            {supportsDestinationFolder && (
                <>
                    <button
                        type="button"
                        className="btn btn-secondary toolbar-folder-btn"
                        onClick={handleChooseDestinationFolder}
                    >
                        {destinationFolderName ? `תיקייה: ${destinationFolderName}` : 'בחר תיקיית יעד'}
                    </button>
                    {destinationFolderName && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => { setDestinationDirHandle(null); setDestinationFolderName(''); }}
                        >
                            נקה
                        </button>
                    )}
                </>
            )}
            <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                aria-label="פורמט הייצוא"
                disabled={isExporting}
            >
                {Object.values(EXPORT_FORMAT).map((value) => (
                    <option key={value} value={value}>
                        {EXPORT_FORMAT_LABELS[value]}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="btn btn-primary"
                onClick={exportDocument}
                title={!canExport ? getDisabledMessage() : undefined}
            >
                {isExporting ? 'מייצא...' : `ייצוא ל-${EXPORT_FORMAT_LABELS[format]}`}
            </button>
        </>
    );

};

export default WordExport;
