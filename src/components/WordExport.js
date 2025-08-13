import React, { useState } from 'react';
import { Document, Packer, Table, TableRow, TableCell, Paragraph, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

// Constants for table configuration
const TABLE_CONSTANTS = {
    CELLS_PER_ROW: 2,
    BORDER_SIZE: 10,
    BORDER_STYLE: 'thick',
    CELL_WIDTH: 4500,
    TABLE_WIDTH: 9000,
    COLORS: {
        BLUE: '0000FF',
        RED: 'FF0000'
    },
    IMAGE_SIZE: {
        width: 200,
        height: 200
    }
};

const WordExport = ({ blueTableData = [], redTableData = [] }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [documentTitle, setDocumentTitle] = useState('');
    
    // Check if there are any images selected in either table
    const hasImages = (blueTableData.length > 0 || redTableData.length > 0);

    const base64ToBlob = async (base64) => {
        const response = await fetch(base64);
        const blob = await response.blob();
        return blob;
    };

    const createTableRows = async (data = [], color) => {
        const rows = [];
        
        // Convert color names to hex codes
        const colorHex = color === 'blue' ? TABLE_CONSTANTS.COLORS.BLUE : TABLE_CONSTANTS.COLORS.RED;
        
        // If no data, create one empty row
        if (!data || data.length === 0) {
            const emptyCells = [];
            for (let j = 0; j < TABLE_CONSTANTS.CELLS_PER_ROW; j++) {
                emptyCells.push(
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
            }
            rows.push(new TableRow({ children: emptyCells }));
            return rows;
        }
        
        // Create rows from data
        for (let i = 0; i < data.length; i += TABLE_CONSTANTS.CELLS_PER_ROW) {
            const rowData = data.slice(i, i + TABLE_CONSTANTS.CELLS_PER_ROW);
            const cells = [];

            // Fill cells based on available images
            for (let j = 0; j < TABLE_CONSTANTS.CELLS_PER_ROW; j++) {
                const imageUrl = rowData[j];
                if (!imageUrl) {
                    // Add empty cell without borders for missing images
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
                    const imageBlob = await base64ToBlob(imageUrl);
                    const buffer = await imageBlob.arrayBuffer();
                    
                    cells.push(
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: buffer,
                                            transformation: TABLE_CONSTANTS.IMAGE_SIZE,
                                            alignment: 'center',
                                        }),
                                    ],
                                }),
                            ],
                            borders: {
                                top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                            },
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            verticalAlign: 'center',
                        })
                    );
                } catch (error) {
                    console.error('Error processing image:', error);
                    cells.push(
                        new TableCell({
                            children: [new Paragraph({ text: 'Image loading error' })],
                            borders: {
                                top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                                right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: colorHex },
                            },
                            width: { size: TABLE_CONSTANTS.CELL_WIDTH, type: WidthType.DXA },
                            verticalAlign: 'center',
                        })
                    );
                }
            }

            const row = new TableRow({ children: cells });
            rows.push(row);
        }
        
        return rows;
    };

    const exportToWord = async () => {
        if (isExporting) return;
        
        try {
            setIsExporting(true);
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({ 
                            text: new Date().toLocaleDateString('en-GB', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
                            }),
                            spacing: {
                                after: 400
                            }
                        }),
                        new Paragraph({ 
                            text: documentTitle || "Tables Export", 
                            heading: 'Heading1', 
                            alignment: 'center', 
                            size: 64, 
                            color: '000000',
                            spacing: {
                                after: 400
                            }}),
                        new Paragraph({ text: "חתימות מקוריות", heading: 'Heading2', color: 'black', alignment: 'center' , size: 48, 
                            spacing: {
                                after: 400
                            }}),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(blueTableData, 'blue'),
                            tableProperties: {
                                tableWidth: {
                                    size: TABLE_CONSTANTS.TABLE_WIDTH,
                                    type: WidthType.DXA,
                                },
                                borders: {
                                    top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    insideHorizontal: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                    insideVertical: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.BLUE },
                                },
                            },
                        }),
                        new Paragraph({ text: "חתימות במחלוקת", heading: 'Heading2' , color: 'black', alignment: 'center', size: 48,  
                            spacing: {
                                after: 400,
                                before: 400
                            }}),
                        new Table({
                            width: { size: TABLE_CONSTANTS.TABLE_WIDTH, type: WidthType.DXA },
                            rows: await createTableRows(redTableData, 'red'),
                            tableProperties: {
                                tableWidth: {
                                    size: TABLE_CONSTANTS.TABLE_WIDTH,
                                    type: WidthType.DXA,
                                },
                                borders: {
                                    top: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                                    bottom: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                                    left: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                                    right: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                                    insideHorizontal: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                                    insideVertical: { style: TABLE_CONSTANTS.BORDER_STYLE, size: TABLE_CONSTANTS.BORDER_SIZE, color: TABLE_CONSTANTS.COLORS.RED },
                                },
                            },
                        }),
                    ],
                }],
            });

            const buffer = await Packer.toBlob(doc);
            const fileName = documentTitle ? `${documentTitle}.docx` : 'tables-export.docx';
            saveAs(buffer, fileName);
        } catch (error) {
            console.error('Error creating Word document:', error);
            alert('Error creating Word document. Please try again.');
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
                disabled={isExporting || !hasImages}
                style={{ padding: '6px 12px' }}
            >
                {isExporting ? 'Exporting...' : hasImages ? 'Export to Word' : 'Select images to export'}
            </button>
        </div>
    );
};

export default WordExport;
