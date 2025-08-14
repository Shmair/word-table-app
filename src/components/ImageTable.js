import React from 'react';
import RemoveBtn from './RemoveBtn';
import CropBtn from './CropBtn';

const ImageTable = ({ data, color, onUpdateImageNumber, onSort, onRemoveImage, onUpdateImage }) => {
    const CELLS_PER_ROW = 2;
    
    const handleNumberChange = (index, value) => {
        const number = parseInt(value);
        if (!isNaN(number) && number > 0) {
            onUpdateImageNumber(index, number);
        }
    };

    const handleSort = () => {
        if (onSort && data && data.length > 0) {
            const sortedIndices = [...data]
                .map((item, index) => ({
                    index,
                    number: item ? (item.number || index + 1) : Infinity
                }))
                .sort((a, b) => a.number - b.number)
                .map(item => item.index);
            
            onSort(sortedIndices);
        }
    };

    const rows = [];
    for (let i = 0; i < data.length; i += CELLS_PER_ROW) {
        const rowData = data.slice(i, i + CELLS_PER_ROW);
        while (rowData.length < CELLS_PER_ROW) {
            rowData.push(null);
        }
        rows.push(rowData);
    }

    return (
        <table style={{ border: `2px solid ${color}`, margin: "10px", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th colSpan={CELLS_PER_ROW} style={{ color, padding: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
                            <span>חתימות {color === "blue" ? "מקוריות" : "במחלוקת"}</span>
                            <button 
                                onClick={handleSort}
                                disabled={!data || data.length === 0}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: color,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: data && data.length > 0 ? "pointer" : "not-allowed",
                                    opacity: data && data.length > 0 ? 1 : 0.5
                                }}
                            >
                                סדר לפי מספר
                            </button>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                        {row.map((imageData, cellIdx) => (
                            <td key={cellIdx} style={{ 
                                border: `1px solid ${color}`, 
                                padding: "10px",
                                textAlign: "center"
                            }}>
                                {imageData ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", position: "relative" }}>
                                        <div style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: "5px" }}>
                                            <RemoveBtn onClick={() => onRemoveImage(rowIdx * CELLS_PER_ROW + cellIdx)} />
                                            <CropBtn 
                                                imageUrl={imageData.url}
                                                onCropComplete={(croppedUrl) => {
                                                    onUpdateImage(rowIdx * CELLS_PER_ROW + cellIdx, {
                                                        ...imageData,
                                                        url: croppedUrl
                                                    });
                                                }}
                                            />
                                        </div>
                                        <img 
                                            src={imageData.url} 
                                            alt={`${color}-${rowIdx}-${cellIdx}`} 
                                            style={{ 
                                                width: "150px",
                                                height: "150px",
                                                objectFit: "contain"
                                            }} 
                                        />
                                        <div style={{ 
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px"
                                        }}>
                                            <span style={{ color }}>#</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={imageData.number || rowIdx * CELLS_PER_ROW + cellIdx + 1}
                                                onChange={(e) => handleNumberChange(rowIdx * CELLS_PER_ROW + cellIdx, e.target.value)}
                                                style={{
                                                    width: "60px",
                                                    padding: "4px",
                                                    border: `1px solid ${color}`,
                                                    borderRadius: "4px",
                                                    color,
                                                    textAlign: "center"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ 
                                        width: "150px", 
                                        height: "150px" 
                                    }} />
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ImageTable;
