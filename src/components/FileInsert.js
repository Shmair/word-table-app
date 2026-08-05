import { useRef, useState } from 'react';
import WordExport from './WordExport';
import { TABLE_TYPE, TABLE_LABELS, STYLES, FILE_INPUT_LABELS } from '../constants';

const TABLE_OPTIONS = [
    { value: TABLE_TYPE.RED, label: TABLE_LABELS.DISPUTED_SIGNATURES },
    { value: TABLE_TYPE.GREEN, label: TABLE_LABELS.ORIGINAL_SIGNATURES }
];

// The target table is picked by clicking it, so this only reports which one is active.
const FileUpload = ({ onFileInsert, greenTableData, redTableData, tableChoice }) => {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [readError, setReadError] = useState(null);
    const [isInserting, setIsInserting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        insertFiles(event.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        insertFiles(e.dataTransfer?.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Files go straight into the selected table -- picking them is the whole intent, so there
    // is nothing left for a separate confirm step to do.
    const insertFiles = (files) => {
        if (!files || files.length === 0) return;

        setSelectedFiles(files);
        setIsInserting(true);
        setReadError(null);

        const fileArray = Array.from(files).filter((f) => f && f instanceof Blob && (f.type?.startsWith('image/') || !f.type));
        if (fileArray.length === 0) {
            setIsInserting(false);
            setSelectedFiles(null);
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
            })
            .catch((err) => {
                console.error('File read error:', err);
                setReadError(err?.message || err?.toString?.() || 'נסה שוב');
            })
            .finally(() => {
                setIsInserting(false);
                // Clear on failure too: the status line only shows the error once nothing is
                // selected, and an unchanged input value fires no change event, which would
                // make retrying the very same file impossible.
                setSelectedFiles(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            });
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
            <span className="file-status">
                {TABLE_OPTIONS.find((o) => o.value === (tableChoice ?? TABLE_OPTIONS[0].value))?.label}
            </span>
            <WordExport greenTableData={greenTableData} redTableData={redTableData} />
        </div>
    );
};

export default FileUpload;