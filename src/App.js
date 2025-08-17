import React, { useState } from 'react';
import ColorTable from './components/ColorTable';
import FileInsert from './components/FileInsert';
import { TABLE_TYPE, COLORS, STYLES } from './constants';

const App = () => {
    const [greenTableData, setgreenTableData] = useState([]);
    const [redTableData, setRedTableData] = useState([]);

    const handleUpdateImageNumber = (index, number, tableType) => {
        if (tableType === TABLE_TYPE.GREEN) {
            setgreenTableData(prevData => {
                const newData = [...prevData];
                if (newData[index]) {
                    newData[index] = { ...newData[index], number };
                }
                return newData;
            });
        } else if (tableType === TABLE_TYPE.RED) {
            setRedTableData(prevData => {
                const newData = [...prevData];
                if (newData[index]) {
                    newData[index] = { ...newData[index], number };
                }
                return newData;
            });
        }
    };

    const handleSort = (sortedIndices, tableType) => {
        if (tableType === TABLE_TYPE.GREEN) {
            setgreenTableData(prevData => {
                const newData = [...prevData];
                sortedIndices.forEach((oldIndex, newIndex) => {
                    newData[newIndex] = prevData[oldIndex];
                });
                return newData;
            });
        } else if (tableType === TABLE_TYPE.RED) {
            setRedTableData(prevData => {
                const newData = [...prevData];
                sortedIndices.forEach((oldIndex, newIndex) => {
                    newData[newIndex] = prevData[oldIndex];
                });
                return newData;
            });
        }
    };
   
    const handleFileInsert = (files, tableType) => {
        const processFile = (file, index) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        url: e.target.result,
                        number: null // Will use default numbering until user changes it
                    });
                };
                reader.readAsDataURL(file);
            });
        };

        // Process all files in parallel
        Promise.all(Array.from(files).map((file, index) => processFile(file, index)))
            .then(imageData => {
                const processedImageData = imageData.map((img, idx) => ({
                    ...img,
                    number: idx + 1 // Set initial sequential numbers
                }));
                
                if (tableType === TABLE_TYPE.GREEN) {
                    setgreenTableData(prevData => {
                        const startNumber = prevData.length > 0 
                            ? Math.max(...prevData.filter(item => item && item.number).map(item => item.number || 0)) + 1 
                            : 1;
                        return [...prevData, ...processedImageData.map((img, idx) => ({
                            ...img,
                            number: startNumber + idx
                        }))];
                    });
                } else if (tableType === TABLE_TYPE.RED) {
                    setRedTableData(prevData => {
                        const startNumber = prevData.length > 0 
                            ? Math.max(...prevData.filter(item => item && item.number).map(item => item.number || 0)) + 1 
                            : 1;
                        return [...prevData, ...processedImageData.map((img, idx) => ({
                            ...img,
                            number: startNumber + idx
                        }))];
                    });
                }
            });
};                  
    return (
        <div align="center" style={{ padding: STYLES.PADDING.DEFAULT }}>
            <h1>חתימות</h1>
            <FileInsert 
                onFileInsert={handleFileInsert}
                greenTableData={greenTableData}
                redTableData={redTableData}
            />
             <ColorTable 
                data={redTableData}
                color={COLORS.RED}
                onUpdateImage={(index, updatedImage) => {
                    setRedTableData(prev => {
                        const newData = Array(prev.length).fill(null);
                        prev.forEach((item, i) => {
                            if (i === index) {
                                newData[i] = updatedImage;
                            } else {
                                newData[i] = item;
                            }
                        });
                        return newData;
                    });
                }}
                onRemoveImage={(index) => setRedTableData(prev => prev.filter((_, i) => i !== index))}
                onUpdateImageNumber={(index, number) => handleUpdateImageNumber(index, number, TABLE_TYPE.RED)}
                onSort={(sortedIndices) => handleSort(sortedIndices, TABLE_TYPE.RED)}
            />
            <ColorTable 
                data={greenTableData}
                color={COLORS.GREEN}
                onUpdateImage={(index, updatedImage) => {
                    setgreenTableData(prev => {
                        const newData = Array(prev.length).fill(null);
                        prev.forEach((item, i) => {
                            if (i === index) {
                                newData[i] = updatedImage;
                            } else {
                                newData[i] = item;
                            }
                        });
                        return newData;
                    });
                }}
                onRemoveImage={(index) => setgreenTableData(prev => prev.filter((_, i) => i !== index))}
                onUpdateImageNumber={(index, number) => handleUpdateImageNumber(index, number, TABLE_TYPE.GREEN)}
                onSort={(sortedIndices) => handleSort(sortedIndices, TABLE_TYPE.GREEN)}
            />
        </div>
    );
};

export default App;