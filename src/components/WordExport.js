import { AlignmentType, Document, Footer, ImageRun, Packer, Paragraph, PageNumber, Table, TableCell, TableLayoutType, TableRow, TextRun, WidthType } from 'docx';
import { useState } from 'react';
import { TABLE_CONSTANTS, TABLE_TYPE, TABLE_LABELS, EXPORT_MESSAGES } from '../constants';

const WordExport = ({ greenTableData, redTableData }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [documentTitle, setDocumentTitle] = useState('');
    const [destinationDirHandle, setDestinationDirHandle] = useState(null);
    const [destinationFolderName, setDestinationFolderName] = useState('');

    const supportsDestinationFolder = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

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

    const processImage = async (imageUrl) => {
        try {
            console.log('Processing image:', imageUrl.substring(0, 50) + '...');
            let originalWidth, originalHeight;
            
            // Validate image URL format
            if (!imageUrl || (typeof imageUrl !== 'string')) {
                throw new Error('Invalid image URL format');
            }

            // Create an image element to load and process the image
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            // Load the image and get its dimensions
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });
            
            originalWidth = img.width;
            originalHeight = img.height;
            
            // Always create a new canvas and convert to JPEG
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Fill with white background first (for transparency)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Convert to JPEG format with high quality
            const base64String = canvas.toDataURL('image/jpeg', 0.95);

            // Calculate aspect ratio-preserving dimensions
            let finalWidth = originalWidth;
            let finalHeight = originalHeight;
            
            // Scale down if exceeds maximum dimensions while preserving aspect ratio
            if (finalWidth > TABLE_CONSTANTS.IMAGE_SIZE.maxWidth || finalHeight > TABLE_CONSTANTS.IMAGE_SIZE.maxHeight) {
                const ratio = Math.min(
                    TABLE_CONSTANTS.IMAGE_SIZE.maxWidth / finalWidth,
                    TABLE_CONSTANTS.IMAGE_SIZE.maxHeight / finalHeight
                );
                finalWidth = Math.round(finalWidth * ratio);
                finalHeight = Math.round(finalHeight * ratio);
            }

            // Extract the base64 data
            const base64Data = base64String.split(';base64,').pop();
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const buffer = byteArray.buffer.slice(byteArray.byteOffset, byteArray.byteOffset + byteArray.byteLength);
            return {
                buffer,
                width: finalWidth,
                height: finalHeight
            };
        } catch (error) {
            console.error('Error processing image:', error);
            console.error('Image URL:', imageUrl);
            throw new Error('Failed to process image: ' + error.message);
        }
    };

    const createTableRows = async (data, color) => {
        const rows = [];
        const colorHex = color === TABLE_TYPE.GREEN ? TABLE_CONSTANTS.COLORS.GREEN : TABLE_CONSTANTS.COLORS.RED;
        
        for (let i = 0; i < data.length; i += TABLE_CONSTANTS.CELLS_PER_ROW) {
            const rowData = data.slice(i, i + TABLE_CONSTANTS.CELLS_PER_ROW);
            const cells = [];

            for (let j = 0; j < TABLE_CONSTANTS.CELLS_PER_ROW; j++) {
                const imageData = rowData[j];
                if (!imageData || !imageData.url) {
                    cells.push(
                        new TableCell({
                            children: [new Paragraph({ text: '' })],
                            borders: {
                                top: { style: 'nil', size: 0 },
                                bottom: { style: 'nil', size: 0 },
                                left: { style: 'nil', size: 0 },
                                right: { style: 'nil', size: 0 },
                            },
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            height: { size: 6500, rule: 'atLeast' },
                            verticalAlign: 'center'
                        })
                    );
                    continue;
                }

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
                                        before: 600, 
                                        after: 400
                                    },
                                    alignment: 'center'
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: '#' + (imageData.number || i + j + 1),
                                            bold: true,
                                            size: TABLE_CONSTANTS.FONT_SIZE
                                        })
                                    ],
                                    alignment: 'center',
                                    spacing: { 
                                        before: 400, 
                                        after: 400
                                    }
                                })
                            ],
                            borders: {
                                top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex }
                            },
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            verticalAlign: 'center',
                            height: { size: 6500, rule: 'atLeast' }
                        })
                    );
                } catch (error) {
                    console.error('Error processing image in cell:', error);
                    cells.push(
                        new TableCell({
                            children: [new Paragraph({ text: 'Image error' })],
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            height: { size: 6500, rule: 'atLeast' },
                            verticalAlign: 'center'
                        })
                    );
                }
            }
            rows.push(new TableRow({ children: cells, cantSplit: true }));
        }
        return rows;
    };

    const hasTitle = !!documentTitle?.trim();
    const hasGreenImages = !!greenTableData?.length;
    const hasRedImages = !!redTableData?.length;
    const canExport = hasTitle && hasGreenImages && hasRedImages;

    const getDisabledMessage = () => {
        if (!hasTitle) return EXPORT_MESSAGES.MISSING_TITLE;
        if (!hasRedImages) return EXPORT_MESSAGES.EMPTY_RED_TABLE;
        if (!hasGreenImages) return EXPORT_MESSAGES.EMPTY_GREEN_TABLE;
        return '';
    };

    const exportToWord = async () => {
        if (isExporting) return;
        if (!canExport) {
            alert(getDisabledMessage());
            return;
        }
        
        try {
            setIsExporting(true);
            console.log('Starting document creation...');
        
            // Create document with properties
            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
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
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: new Date().toLocaleDateString('en-GB'),
                                    size: TABLE_CONSTANTS.FONT_SIZE
                                })
                            ],
                            spacing: { after: 400 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: documentTitle || 'Tables Export',
                                    bold: true,
                                    size: 48
                                })
                            ],
                            alignment: 'center',
                            spacing: { after: 400 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: TABLE_LABELS.DISPUTED_SIGNATURES,
                                    size: 32,
                                    color: '000000',
                                    bold: true
                                })
                            ],
                            alignment: 'center',
                            spacing: { before: 400, after: 400 }
                        }),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(redTableData, TABLE_TYPE.RED),
                            tableProperties: {
                                width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                                layout: TableLayoutType.FIXED,
                                margins: {
                                    top: 0,
                                    bottom: 0,
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
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: TABLE_LABELS.ORIGINAL_SIGNATURES,
                                    size: 32,
                                    color: '000000',
                                    bold: true
                                })
                            ],
                            alignment: 'center',
                            spacing: { after: 400, before: 400 }
                        }),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(greenTableData, TABLE_TYPE.GREEN),
                            tableProperties: {
                                layout: TableLayoutType.FIXED,
                                width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                                borders: {
                                    top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                                    bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                                    left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                                    right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                                    insideHorizontal: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN },
                                    insideVertical: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.GREEN }
                                }
                            }
                        })
                    ]
                }]
            });

            console.log('Document object created, starting to pack...');
            
            // Create blob directly in browser environment
            const blob = await Packer.toBlob(doc);
            
            console.log('Document packed to blob, size:', blob.size);
            console.log('Blob MIME type:', blob.type);
            
            const date = new Date().toISOString().split('T')[0];
            const safeTitle = (documentTitle || 'tables-export').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'export';
            const fileName = safeTitle + '-' + date + '.docx';
            
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
                        console.log('Document saved to folder:', destinationFolderName);
                    } catch (folderError) {
                        console.warn('Folder save failed, falling back to download:', folderError);
                        triggerDownload();
                    }
                } else {
                    triggerDownload();
                }
                console.log('Document saved successfully');
            } catch (saveError) {
                throw new Error(saveError?.message || 'Could not save the file');
            }
        } catch (error) {
            console.error('Error details:', error);
            let errorMessage = 'Error creating Word document: ';
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
            <button
                type="button"
                className="btn btn-primary"
                onClick={exportToWord}
                title={!canExport ? getDisabledMessage() : undefined}
            >
                {isExporting ? 'מייצא...' : 'ייצוא ל-Word'}
            </button>
        </>
    );
    
};

export default WordExport;
