import React, { useState, useEffect } from 'react';
import ColorTable from './components/ColorTable';
import FileInsert from './components/FileInsert';
import { TABLE_TYPE, COLORS, STYLES, STORAGE_KEY } from './constants';

const loadFromStorage = () => {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            const { green, red } = JSON.parse(cached);
            return { green: green || [], red: red || [] };
        }
    } catch (e) { /* ignore */ }
    return { green: [], red: [] };
};

const App = () => {
    const [greenTableData, setgreenTableData] = useState(() => loadFromStorage().green);
    const [redTableData, setRedTableData] = useState(() => loadFromStorage().red);
    const [tableChoice, setTableChoice] = useState(TABLE_TYPE.RED);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                green: greenTableData,
                red: redTableData
            }));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('Storage full: images not persisted. Try removing some.');
            }
        }
    }, [greenTableData, redTableData]);

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
   
    const handleFileInsert = (imageData, tableType) => {
        const list = Array.isArray(imageData) ? imageData : [];
        if (list.length === 0) return;

        const processedImageData = list.map((img, idx) => ({
            ...img,
            number: img.number != null ? img.number : idx + 1
        }));

        if (tableType === TABLE_TYPE.GREEN) {
            setgreenTableData((prevData) => {
                const startNumber = prevData.length > 0
                    ? Math.max(...prevData.filter((item) => item && item.number).map((item) => item.number || 0)) + 1
                    : 1;
                return [...prevData, ...processedImageData.map((img, idx) => ({
                    ...img,
                    number: startNumber + idx
                }))];
            });
        } else if (tableType === TABLE_TYPE.RED) {
            setRedTableData((prevData) => {
                const startNumber = prevData.length > 0
                    ? Math.max(...prevData.filter((item) => item && item.number).map((item) => item.number || 0)) + 1
                    : 1;
                return [...prevData, ...processedImageData.map((img, idx) => ({
                    ...img,
                    number: startNumber + idx
                }))];
            });
        }
    };                  
    return (
        <div className="app-container" style={{ padding: STYLES.PADDING.DEFAULT, maxWidth: 1300, margin: '0 auto', direction: 'rtl' }}>
            <h1 className="app-title">חתימות</h1>
            <FileInsert 
                onFileInsert={handleFileInsert}
                greenTableData={greenTableData}
                redTableData={redTableData}
                tableChoice={tableChoice}
                onTableChoiceChange={setTableChoice}
            />
             <ColorTable 
                data={redTableData}
                color={COLORS.RED}
                tableType={TABLE_TYPE.RED}
                isSelected={tableChoice === TABLE_TYPE.RED}
                onSelect={() => setTableChoice(TABLE_TYPE.RED)}
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
                tableType={TABLE_TYPE.GREEN}
                isSelected={tableChoice === TABLE_TYPE.GREEN}
                onSelect={() => setTableChoice(TABLE_TYPE.GREEN)}
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