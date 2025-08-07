import React from 'react';

const RedTable = ({ data }) => {
    const CELLS_PER_ROW = 2; // Number of images per row

    // Group images into rows
    const rows = [];
    for (let i = 0; i < data.length; i += CELLS_PER_ROW) {
        rows.push(data.slice(i, i + CELLS_PER_ROW));
    }

    return (
        <table style={{ border: '2px solid red', margin: '10px', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th colSpan={CELLS_PER_ROW} style={{ color: 'red', padding: '10px' }}>
                        Red Table Images
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                        {row.map((src, cellIdx) => (
                            <td key={cellIdx} style={{ border: '1px solid red', padding: '10px' }}>
                                <img 
                                    src={src} 
                                    alt={`red-${rowIdx}-${cellIdx}`} 
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
                            <td key={`empty-${idx}`} style={{ border: '1px solid red', padding: '10px', width: '150px', height: '150px' }}></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RedTable;