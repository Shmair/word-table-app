import React, { useState } from 'react';
import WordExport from './WordExport';

const FileUpload = ({ onFileUpload, blueTableData, redTableData }) => {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [tableChoice, setTableChoice] = useState('blue');
    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleTableChange = (event) => {
        setTableChoice(event.target.value);
    };

    const handleInsert = () => {
        if (selectedFiles && selectedFiles.length > 0) {
            onFileUpload(selectedFiles, tableChoice);
            setSelectedFiles(null);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px' }}>
            <input 
                type="file" 
                onChange={handleFileChange} 
                multiple 
                accept="image/*"
                style={{ padding: '6px' }}
            />
            <select value={tableChoice} onChange={handleTableChange}>
                <option value="blue">Blue Table</option>
                <option value="red">Red Table</option>
            </select>
            <button onClick={handleInsert}>הכנס לטבלה</button>
            <WordExport blueTableData={blueTableData} redTableData={redTableData} />
        </div>
    );
};

export default FileUpload;