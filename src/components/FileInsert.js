import { useRef, useState } from 'react';
import WordExport from './WordExport';
import { TABLE_TYPE, TABLE_LABELS, STYLES, FILE_INPUT_LABELS } from '../constants';

const TABLE_OPTIONS = [
    { value: TABLE_TYPE.RED, label: TABLE_LABELS.DISPUTED_SIGNATURES },
    { value: TABLE_TYPE.GREEN, label: TABLE_LABELS.ORIGINAL_SIGNATURES }
];

const FileUpload = ({ onFileInsert, greenTableData, redTableData, tableChoice, onTableChoiceChange }) => {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [readError, setReadError] = useState(null);
    const [isInserting, setIsInserting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const files = event.target.files;
        setSelectedFiles(files && files.length > 0 ? files : null);
        setReadError(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            setSelectedFiles(files);
            setReadError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleTableChange = (event) => {
        onTableChoiceChange?.(event.target.value);
    };

    const handleInsert = () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            alert('בחר קבצים תחילה');
            return;
        }
        setIsInserting(true);
        setReadError(null);

        const fileArray = Array.from(selectedFiles).filter((f) => f && f instanceof Blob && (f.type?.startsWith('image/') || !f.type));
        if (fileArray.length === 0) {
            setIsInserting(false);
            alert('לא נמצאו תמונות');
            return;
        }

        const readPromises = fileArray.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ url: e.target.result, number: null });
                reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readPromises)
            .then((imageData) => {
                const processed = imageData.map((img, idx) => ({ ...img, number: idx + 1 }));
                onFileInsert(processed, tableChoice ?? TABLE_OPTIONS[0].value);
                setSelectedFiles(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            })
            .catch((err) => {
                console.error('File read error:', err);
                setReadError(err?.message || err?.toString?.() || 'נסה שוב');
            })
            .finally(() => setIsInserting(false));
    };

    return (
        <div className="app-toolbar toolbar-card">
            <div
                className="file-input-wrapper"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {FILE_INPUT_LABELS.CHOOSE_FILES}
                </button>
                <span className="file-status">
                    {isInserting
                        ? 'טוען...'
                        : selectedFiles && selectedFiles.length > 0
                            ? FILE_INPUT_LABELS.FILES_SELECTED(selectedFiles.length)
                            : readError
                                ? readError
                                : FILE_INPUT_LABELS.NO_FILE_CHOSEN}
                </span>
                {readError && (
                    <span style={{ fontSize: '0.75em', color: '#888', display: 'block', marginTop: 4 }}>
                        {FILE_INPUT_LABELS.READ_ERROR_HINT}
                    </span>
                )}
            </div>
            <select
                value={tableChoice ?? TABLE_OPTIONS[0].value}
                onChange={handleTableChange}
                aria-label="טבלה להכנסת תמונות"
            >
                {TABLE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <button type="button" className="btn btn-secondary" onClick={handleInsert} disabled={isInserting}>
                {isInserting ? 'טוען...' : 'הכנס לטבלה'}
            </button>
            <WordExport greenTableData={greenTableData} redTableData={redTableData} />
        </div>
    );
};

export default FileUpload;