import React, { useState } from 'react';
import BlueTable from './components/BlueTable';
import RedTable from './components/RedTable';
import FileUpload from './components/FileUpload';

const App = () => {
    const [blueTableData, setBlueTableData] = useState([]);
    const [redTableData, setRedTableData] = useState([]);

    const handleFileUpload = (files, tableType) => {
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
        <div>
            <h1>Word Table App</h1>
            <FileUpload 
                onFileUpload={handleFileUpload}
                blueTableData={blueTableData}
                redTableData={redTableData}
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
            />
        </div>
    );
};

export default App;