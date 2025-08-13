import React from 'react';
import ImageTable from './ImageTable';

const CELLS_PER_ROW = 2; // Number of images per row

const BlueTable = ({ data, onUpdateImage }) => {
    const handleUpdateImageNumber = (index, number) => {
        const currentImage = data[index];
        onUpdateImage(index, { 
            ...currentImage, 
            number: number
        });
    };

    const handleSort = (sortedIndices) => {
        // Create new array with sorted data
        const newData = [...data];
        const tempData = [...data];
        
        sortedIndices.forEach((oldIndex, newIndex) => {
            newData[newIndex] = tempData[oldIndex];
        });
        
        // Update the data in the parent component
        newData.forEach((image, index) => {
            if (image) {
                onUpdateImage(index, image);
            }
        });
    };

    return (
        <ImageTable 
            data={data} 
            color="blue" 
            onUpdateImageNumber={handleUpdateImageNumber}
            onSort={handleSort}
        />
    );
};

export default BlueTable;