import React, { useState } from 'react';
import WordExport from './WordExport';

const FileUpload = ({ onFileUpload, blueTableData, redTableData }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [tableChoice, setTableChoice] = useState('blue');
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleTableChange = (event) => {
        setTableChoice(event.target.value);
    };

    const handleUpload = () => {
        if (selectedFile) {
            onFileUpload(selectedFile, tableChoice);
            setSelectedFile(null);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px' }}>
            <input type="file" onChange={handleFileChange} />
            <select value={tableChoice} onChange={handleTableChange}>
                <option value="blue">Blue Table</option>
                <option value="red">Red Table</option>
            </select>
            <button onClick={handleUpload}>Upload</button>
            <WordExport blueTableData={blueTableData} redTableData={redTableData} />
        </div>
    );
};

export default FileUpload;