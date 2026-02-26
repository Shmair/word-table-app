import ImageTable from './ImageTable';

const ColorTable = ({ data, color, tableType, isSelected, onSelect, onSort, onRemoveImage, onUpdateImage, onUpdateImageNumber }) => {
    return (
        <div
            className={`table-section table-${color} ${isSelected ? 'table-section-selected' : ''}`}
            onClick={(e) => { if (!e.target.closest('button, input, select')) onSelect?.(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(); } }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            title="לחץ לבחירת הטבלה להכנסת תמונות"
        >
            <ImageTable
            data={data}
            color={color}
            onSort={onSort}
            onRemoveImage={onRemoveImage}
            onUpdateImage={onUpdateImage}
                onUpdateImageNumber={onUpdateImageNumber}
            />
        </div>
    );
};

export default ColorTable;