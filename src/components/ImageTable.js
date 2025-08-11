import React from 'react';

const ImageTable = ({ data, color }) => {
    const CELLS_PER_ROW = 2; // Number of images per row

    // Group images into rows
    const rows = [];
    for (let i = 0; i < data.length; i += CELLS_PER_ROW) {
        rows.push(data.slice(i, i + CELLS_PER_ROW));
    }

    return (
        <table style={{ border: `2px solid ${color}`, margin: '10px', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th colSpan={CELLS_PER_ROW} style={{ color: color, padding: '10px' }}>
                        חתימות {color == 'blue' ? 'מקוריות' : 'במחלוקת'}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                        {row.map((src, cellIdx) => (
                            <td key={cellIdx} style={{ border: `1px solid ${color}`, padding: '10px' }}>
                                <img 
                                    src={src} 
                                    alt={`${color}-${rowIdx}-${cellIdx}`} 
                                    style={{ 
                                        width: '150px',
                                        height: '150px',
                                        objectFit: 'contain'
                                    }} 
                                />
                            </td>
                        ))}
                        {/* Add empty cells to complete the row */}
                        {[...Array(CELLS_PER_ROW - row.length)].map((_, idx) => (
                            <td key={`empty-${idx}`} style={{ border: `1px solid ${color}`, padding: '10px', width: '150px', height: '150px' }}></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ImageTable;
