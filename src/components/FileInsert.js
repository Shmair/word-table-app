import React, { useState, useRef } from 'react';
import WordExport from './WordExport';

const TABLE_OPTIONS = [
    { value: 'red', label: 'חתימות במחלוקת' },
    { value: 'blue', label: 'חתימות מקוריות' }
];

const FileUpload = ({ onFileInsert, blueTableData, redTableData }) => {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [tableChoice, setTableChoice] = useState(TABLE_OPTIONS[0].value);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleTableChange = (event) => {
        setTableChoice(event.target.value);
    };

    const handleInsert = () => {
        if (selectedFiles && selectedFiles.length > 0) {
            onFileInsert(selectedFiles, tableChoice);
            setSelectedFiles(null);
            fileInputRef.current.value = ''
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px' }}>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                multiple 
                accept="image/*"
                style={{ padding: '6px' }}
            />
            <select value={tableChoice} onChange={handleTableChange}>
                {TABLE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <button onClick={handleInsert}>הכנס לטבלה</button>
            <WordExport blueTableData={blueTableData} redTableData={redTableData} />
        </div>
    );
};

export default FileUpload;