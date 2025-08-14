import React, { useState } from 'react';
import BlueTable from './components/BlueTable';
import RedTable from './components/RedTable';
import FileInsert from './components/FileInsert';
import WordExport from './components/WordExport';

const App = () => {
    const [blueTableData, setBlueTableData] = useState([]);
    const [redTableData, setRedTableData] = useState([]);
   
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
                
                if (tableType === 'blue') {
                    setBlueTableData(prevData => {
                        const startNumber = prevData.length > 0 
                            ? Math.max(...prevData.filter(item => item && item.number).map(item => item.number || 0)) + 1 
                            : 1;
                        return [...prevData, ...processedImageData.map((img, idx) => ({
                            ...img,
                            number: startNumber + idx
                        }))];
                    });
                } else if (tableType === 'red') {
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
        <div align="center" style={{ padding: '20px' }}>
            <h1>חתימות</h1>
            <FileInsert 
                onFileInsert={handleFileInsert}
                blueTableData={blueTableData}
                redTableData={redTableData}
            />
             <RedTable 
                data={redTableData} 
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
                onRemoveImage={(index) =>  setRedTableData(prev => prev.filter((_, i) => i !== index))}
            />
            <BlueTable 
                data={blueTableData} 
                onUpdateImage={(index, updatedImage) => {
                    setBlueTableData(prev => {
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
                onRemoveImage={(index) => setBlueTableData(prev => prev.filter((_, i) => i !== index))}
            />
        </div>
    );
};

export default App;