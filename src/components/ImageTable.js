import { SIZES, STYLES, COLORS, TABLE_LABELS } from '../constants';
import CropBtn from './CropBtn';
import RemoveBtn from './RemoveBtn';
import RotateBtn from './RotateBtn';

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
                .map((item) => item.index);
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
        <table className={`table-bordered table-${color}`} style={{ margin: 0, borderCollapse: "collapse", width: "100%" }}>
            <thead>
                <tr>
                    <th colSpan={CELLS_PER_ROW} style={{ color, padding: "40px", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "0 44px" }}>
                            <span style={{padding: STYLES.PADDING.MEDIUM, textAlign: STYLES.TEXT_ALIGN.CENTER}}>
                                {color === COLORS.GREEN ? TABLE_LABELS.ORIGINAL_SIGNATURES : TABLE_LABELS.DISPUTED_SIGNATURES}
                            </span>
                            <button 
                                className="sort-btn table-sort-btn"
                                onClick={handleSort}
                                disabled={!data || data.length === 0}
                                style={{
                                    position: "absolute",
                                    insetInlineEnd: "20px",
                                    padding: "8px 16px",
                                    backgroundColor: color,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: data && data.length > 0 ? "pointer" : "not-allowed",
                                    opacity: data && data.length > 0 ? 1 : 0.5,
                                    fontWeight: 500
                                }}
                            >
                                {'סדר לפי מספר'}
                            </button>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                        {row.map((imageData, cellIdx) => (
                            <td key={cellIdx} className={`image-cell image-cell-${color}`} style={{ 
                                padding: "25px",
                                textAlign: "center"
                            }}>
                                {imageData ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                        <div className="image-actions-row">
                                            <RotateBtn 
                                                imageUrl={imageData.url}
                                                onRotateComplete={(rotatedUrl) => {
                                                    onUpdateImage(rowIdx * CELLS_PER_ROW + cellIdx, {
                                                        ...imageData,
                                                        url: rotatedUrl
                                                    });
                                                }}
                                            />
                                            <CropBtn 
                                                imageUrl={imageData.url}
                                                onCropComplete={(croppedUrl) => {
                                                    onUpdateImage(rowIdx * CELLS_PER_ROW + cellIdx, {
                                                        ...imageData,
                                                        url: croppedUrl
                                                    });
                                                }}
                                            />
                                            <RemoveBtn onClick={() => onRemoveImage(rowIdx * CELLS_PER_ROW + cellIdx)} />
                                        </div>
                                        <img 
                                            src={imageData.url} 
                                            alt={`${color}-${rowIdx}-${cellIdx}`} 
                                            style={{ 
                                                width: SIZES.IMAGE.WIDTH,
                                                height: SIZES.IMAGE.HEIGHT,
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
                                                className="image-number-input"
                                                value={imageData.number || rowIdx * CELLS_PER_ROW + cellIdx + 1}
                                                onChange={(e) => handleNumberChange(rowIdx * CELLS_PER_ROW + cellIdx, e.target.value)}
                                                style={{
                                                    width: SIZES.INPUT.WIDTH,
                                                    padding: STYLES.PADDING.TINY,
                                                    border: `1px solid ${color}`,
                                                    borderRadius: STYLES.BORDER.RADIUS,
                                                    color,
                                                    textAlign: STYLES.TEXT_ALIGN.CENTER
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="image-cell-empty"
                                        style={{ width: SIZES.IMAGE.WIDTH, height: SIZES.IMAGE.HEIGHT }} 
                                    />
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
