import React, { useState } from 'react';
import { Document, Packer, Table, TableRow, TableCell, Paragraph, WidthType, ImageRun, TextRun } from 'docx';
import { saveAs } from 'file-saver';


const TABLE_CONSTANTS = {
    CELLS_PER_ROW: 2,
    BORDER_SIZE: 20,
    BORDER_STYLE: 'single',
    CELL_WIDTH: 4500,
    TABLE_WIDTH: 9000,
    COLORS: {
        BLUE: '0070C0',  // Changed to a more standard Word blue
        RED: 'C00000'    // Changed to a more standard Word red
    },
    IMAGE_SIZE: {
        maxWidth: 250,  // Maximum width allowed
        maxHeight: 250  // Maximum height allowed
    }
};

const WordExport = ({ blueTableData, redTableData }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [documentTitle, setDocumentTitle] = useState('');

    const processImage = async (imageUrl) => {
        try {
            let base64String = imageUrl;
            let originalWidth, originalHeight;
            
            // If the URL is not a base64 string, convert it
            if (!imageUrl.startsWith('data:')) {
                // Create a canvas to convert the image
                const img = new Image();
                img.crossOrigin = "anonymous";
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imageUrl;
                });
                
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                base64String = canvas.toDataURL('image/jpeg', 1.0);
                originalWidth = img.width;
                originalHeight = img.height;
            } else {
                // Get dimensions from base64 image
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = base64String;
                });
                originalWidth = img.width;
                originalHeight = img.height;
            }

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
            return {
                buffer: byteArray.buffer,
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
        const colorHex = color === 'blue' ? TABLE_CONSTANTS.COLORS.BLUE : TABLE_CONSTANTS.COLORS.RED;
        
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
                                            data: processedImage.buffer,
                                            transformation: {
                                                width: processedImage.width,
                                                height: processedImage.height
                                            }
                                        })
                                    ],
                                    spacing: { before: 600, after: 400 },
                                    alignment: 'center'
                                }),
                                new Paragraph({
                                    text: '#' + (imageData.number || i + j + 1),
                                    alignment: 'center',
                                    spacing: { before: 400, after: 400 }
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
                            height: { size: 6000, rule: 'atLeast' }
                        })
                    );
                } catch (error) {
                    console.error('Error processing image in cell:', error);
                    cells.push(
                        new TableCell({
                            children: [new Paragraph({ text: 'Image error' })],
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA }
                        })
                    );
                }
            }
            rows.push(new TableRow({ children: cells }));
        }
        return rows;
    };

    const exportToWord = async () => {
        if (isExporting) return;
        
        if (!blueTableData?.length && !redTableData?.length) {
            alert('No images to export. Please add some images first.');
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
                    children: [
                        new Paragraph({
                            text: new Date().toLocaleDateString('en-GB'),
                            spacing: { after: 400 }
                        }),
                        new Paragraph({
                            text: documentTitle || 'Tables Export',
                            heading: 'Title',
                            alignment: 'center',
                            spacing: { after: 400 }
                        }),
                         new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'חתימות במחלוקת',
                                    size: 32,
                                    color: '000000',
                                    bold: true
                                })
                            ],
                            alignment: 'center',
                            spacing: { before: 400, after: 400 },
                            bidirectional: true
                        }),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(redTableData, 'red'),
                            tableProperties: {
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
                                    text: 'חתימות מקוריות',
                                    size: 32,
                                    color: '000000',
                                    bold: true
                                })
                            ],
                            alignment: 'center',
                            spacing: { after: 400 , before: 400 },
                            bidirectional: true
                        }),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(blueTableData, 'blue'),
                            tableProperties: {
                                borders: {
                                    top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    insideHorizontal: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    insideVertical: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE }
                                }
                            }
                        })
                    ]
                }]
            });

            console.log('Document object created, starting to pack...');
            const blob = await Packer.toBlob(doc);
            console.log('Document packed to blob, size:', blob.size);
            console.log('Blob created, size:', blob.size);
            
            const date = new Date().toISOString().split('T')[0];
            const safeTitle = (documentTitle || 'tables-export').replace(/[^a-zA-Z0-9-]/g, '-');
            const fileName = safeTitle + '-' + date + '.docx';
            
            try {
                await saveAs(blob, fileName);
                console.log('Document saved successfully');
            } catch (saveError) {
                throw new Error(`Failed to save document: ${saveError.message}`);
            }
        } catch (error) {
            console.error('Error details:', error);
            let errorMessage = 'Error creating Word document: ';
            if (error.message.includes('base64')) {
                errorMessage += 'Invalid image data';
            } else if (error.message.includes('save')) {
                errorMessage += 'Could not save the file';
            } else {
                errorMessage += error.message || 'Unknown error occurred';
            }
            alert(errorMessage);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title"
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                    onClick={exportToWord} 
                    disabled={isExporting || !documentTitle}
                    style={{ padding: '6px 12px' }}
                >
                    {isExporting ? 'Exporting...' : 'Export to Word'}
                </button>
            </div>
        </div>
    );
    
};

export default WordExport;
