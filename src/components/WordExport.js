import React, { useState } from 'react';
import { Document, Packer, Table, TableRow, TableCell, Paragraph, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

const TABLE_CONSTANTS = {
    CELLS_PER_ROW: 2,
    BORDER_SIZE: 1,
    BORDER_STYLE: 'single',
    CELL_WIDTH: 5000,
    TABLE_WIDTH: 10000,
    COLORS: {
        BLUE: '0000FF',
        RED: 'FF0000'
    },
    IMAGE_SIZE: {
        width: 150,
        height: 150
    }
};

const WordExport = ({ blueTableData, redTableData }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [documentTitle, setDocumentTitle] = useState('');

    const processImage = async (base64) => {
        try {
            if (!base64) {
                throw new Error('Image data is empty');
            }

            if (!base64.includes('base64')) {
                throw new Error('Invalid image data format');
            }

            const base64Data = base64.split(',')[1];
            if (!base64Data) {
                throw new Error('Could not extract base64 data');
            }

            let binaryString;
            try {
                binaryString = window.atob(base64Data);
            } catch (e) {
                throw new Error('Invalid base64 encoding');
            }

            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            return bytes.buffer;
        } catch (error) {
            console.error('Error processing image:', error.message);
            throw new Error(`Failed to process image: ${error.message}`);
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
                            verticalAlign: 'center',
                        })
                    );
                    continue;
                }

                try {
                    const imageBuffer = await processImage(imageData.url);
                    cells.push(
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: imageBuffer,
                                            transformation: TABLE_CONSTANTS.IMAGE_SIZE
                                        })
                                    ],
                                    alignment: 'center'
                                }),
                                new Paragraph({
                                    text: '#' + (imageData.number || i + j + 1),
                                    alignment: 'center',
                                    spacing: { before: 200 }
                                })
                            ],
                            borders: {
                                top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex }
                            },
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            verticalAlign: 'center'
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
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({ 
                            children: [{ text: new Date().toLocaleDateString('en-GB'), color: '000000' }],
                            spacing: { after: 400 }
                        }),
                        new Paragraph({ 
                            children: [{ text: documentTitle || 'Tables Export', color: '000000' }],
                            heading: 'Heading1',
                            alignment: 'center',
                            spacing: { after: 400 }
                        }),
                        new Paragraph({ 
                            children: [{ text: 'חתימות מקוריות', color: '000000' }],
                            heading: 'Heading2',
                            alignment: 'center',
                            spacing: { after: 400 }
                        }),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(blueTableData, 'blue')
                        }),
                        new Paragraph({ 
                            children: [{ text: 'חתימות במחלוקת', color: '000000' }],
                            heading: 'Heading2',
                            alignment: 'center',
                            spacing: { before: 400, after: 400 }
                        }),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(redTableData, 'red')
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button 
                onClick={exportToWord} 
                disabled={isExporting}
                style={{ padding: '6px 12px' }}
            >
                {isExporting ? 'Exporting...' : 'Export to Word'}
            </button>
        </div>
    );
};

export default WordExport;
