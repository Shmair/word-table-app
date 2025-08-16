import React from 'react';
import ImageTable from './ImageTable';

const ColorTable = ({ data, color, onSort, onRemoveImage, onUpdateImage, onUpdateImageNumber }) => {
    return (
            <ImageTable
                data={data}
                color={color}
                onSort={onSort}
                onRemoveImage={onRemoveImage}
                onUpdateImage={onUpdateImage}
                onUpdateImageNumber={onUpdateImageNumber}
            />
    );
};

export default ColorTable;