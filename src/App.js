import React, { useState, useEffect } from 'react';
import ColorTable from './components/ColorTable';
import FileInsert from './components/FileInsert';
import { TABLE_TYPE, COLORS, STYLES } from './constants';
import { loadTables, saveTables, readLocalStorage, isEmpty } from './utils/imageStore';
import { renumberSequentially } from './utils/tableUtils';

const App = () => {
    // Seed synchronously from localStorage so a small gallery paints immediately; IndexedDB
    // holds the authoritative copy and overwrites this once it has loaded.
    const [greenTableData, setgreenTableData] = useState(() => renumberSequentially(readLocalStorage().green));
    const [redTableData, setRedTableData] = useState(() => renumberSequentially(readLocalStorage().red));
    const [tableChoice, setTableChoice] = useState(TABLE_TYPE.RED);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        loadTables()
            .then((stored) => {
                if (cancelled || isEmpty(stored)) return;
                // Close any gaps left by earlier add/remove cycles, so labels read 1..N.
                // Keep anything already added while this load was in flight -- dropping files
                // straight after opening the app must not be undone by the load landing late.
                setgreenTableData((current) => (current.length ? current : renumberSequentially(stored.green)));
                setRedTableData((current) => (current.length ? current : renumberSequentially(stored.red)));
            })
            .catch((e) => console.warn('Could not load saved images:', e))
            .finally(() => { if (!cancelled) setIsLoaded(true); });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        // Skip until the initial load settles, otherwise the empty starting state would
        // overwrite what is on disk.
        if (!isLoaded) return;
        saveTables({ green: greenTableData, red: redTableData })
            .then((ok) => {
                if (!ok) console.warn('Images could not be saved: storage is full.');
            })
            .catch((e) => console.warn('Could not save images:', e));
    }, [greenTableData, redTableData, isLoaded]);

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

        const append = (prevData) => renumberSequentially([...prevData, ...list]);

        if (tableType === TABLE_TYPE.GREEN) {
            setgreenTableData(append);
        } else if (tableType === TABLE_TYPE.RED) {
            setRedTableData(append);
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
                onRemoveImage={(index) => setRedTableData(prev => renumberSequentially(prev.filter((_, i) => i !== index)))}
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
                onRemoveImage={(index) => setgreenTableData(prev => renumberSequentially(prev.filter((_, i) => i !== index)))}
                onUpdateImageNumber={(index, number) => handleUpdateImageNumber(index, number, TABLE_TYPE.GREEN)}
                onSort={(sortedIndices) => handleSort(sortedIndices, TABLE_TYPE.GREEN)}
            />
        </div>
    );
};

export default App;