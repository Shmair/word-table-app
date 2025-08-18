import { useRef, useState } from 'react';
import WordExport from './WordExport';
import { TABLE_TYPE, TABLE_LABELS, STYLES } from '../constants';

const TABLE_OPTIONS = [
    { value: TABLE_TYPE.RED, label: TABLE_LABELS.DISPUTED_SIGNATURES },
    { value: TABLE_TYPE.GREEN, label: TABLE_LABELS.ORIGINAL_SIGNATURES }
];

const FileUpload = ({ onFileInsert, greenTableData, redTableData }) => {
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
        <div style={{ 
            display: STYLES.DISPLAY.FLEX, 
            gap: STYLES.PADDING.SMALL, 
            alignItems: STYLES.ALIGN_ITEMS.CENTER, 
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%',
            padding: STYLES.PADDING.SMALL 
        }}>
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
            <WordExport greenTableData={greenTableData} redTableData={redTableData} />
        </div>
    );
};

export default FileUpload;