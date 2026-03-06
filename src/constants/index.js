// Table/Document constants for WordExport and other components
export const TABLE_CONSTANTS = {
    CELLS_PER_ROW: 2,
    BORDER_SIZE: 25,
    BORDER_STYLE: 'single',
    CELL_WIDTH: 4500,
    TABLE_WIDTH: 9000,
    GRID_WIDTH: 100,
    MARGINS: {
        LEFT: 10,
        RIGHT: 10
    },
    COLORS: {
        GREEN: '275114',
        RED: 'C00000',
        BLACK: '000000'
    },
    IMAGE_SIZE: {
        maxWidth: 300,
        maxHeight: 300
    },
    FONT_SIZE: 30  // 16px ≈ 12pt, docx uses half-points
};
// Table Types
export const TABLE_TYPE = {
    GREEN: 'GREEN',
    RED: 'red'
};

// Table Labels
export const TABLE_LABELS = {
    ORIGINAL_SIGNATURES: 'חתימות מקוריות',
    DISPUTED_SIGNATURES: 'חתימות במחלוקת'
};

// Colors
export const COLORS = {
    RED: 'red',
    GREEN: 'green',
    WHITE: 'white'
};

// UI Theme (for toolbar, buttons, inputs)
export const THEME = {
    primary: '#275114',
    primaryHover: '#1e3d0f',
    primaryLight: '#e8f0e6',
    surface: '#ffffff',
    surfaceAlt: '#f7f9f6',
    border: '#d0d9cc',
    borderFocus: '#275114',
    text: '#1a1a1a',
    textMuted: '#5c5c5c',
    radius: '8px',
    radiusSm: '6px',
    shadow: '0 2px 8px rgba(39, 81, 20, 0.08)',
    shadowHover: '0 4px 12px rgba(39, 81, 20, 0.12)',
    transition: '0.2s ease',
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
};

// Styles
export const STYLES = {
    PADDING: {
        DEFAULT: '20px',
        LARGE: '40px',
        MEDIUM: '15px',
        SMALL: '10px',
        TINY: '5px'
    },
    BORDER: {
        NONE: 'none',
        RADIUS: '4px',
        COLLAPSE: 'collapse'
    },
    DISPLAY: {
        FLEX: 'flex'
    },
    JUSTIFY_CONTENT: {
        SPACE_AROUND: 'space-around'
    },
    ALIGN_ITEMS: {
        CENTER: 'center'
    },
    TEXT_ALIGN: {
        CENTER: 'center'
    },
    CURSOR: {
        POINTER: 'pointer',
        NOT_ALLOWED: 'not-allowed'
    }
};

// Document Settings
export const DOCUMENT = {
    BORDER_STYLE: TABLE_CONSTANTS.BORDER_STYLE,
    COLORS: TABLE_CONSTANTS.COLORS
};

// Proofing language for Word (bidi = complex script / RTL)
export const LANG_HEBREW = { bidi: 'he-IL' };

// Image Settings
export const IMAGE = {
    DATA_URL_PREFIX: 'data:',
    MIME_TYPE: 'image/jpeg',
    CROSS_ORIGIN: 'anonymous'
};

// Local storage key for persisting table data
export const STORAGE_KEY = 'word-table-app-data';

// Export validation (Hebrew)
export const EXPORT_MESSAGES = {
    MISSING_TITLE: 'נא להזין שם מסמך',
    MISSING_IMAGES: 'נא למלא לפחות טבלה אחת בתמונות'
};

// File input labels (Hebrew)
export const FILE_INPUT_LABELS = {
    CHOOSE_FILES: 'בחר קבצים',
    NO_FILE_CHOSEN: 'לא נבחר קובץ',
    FILES_SELECTED: (n) => `${n} קבצים נבחרו`,
    DRAG_HINT: 'או גרור קבצים לכאן',
    READ_ERROR_HINT: 'נסה לגרור קבצים במקום, או להעתיק לתיקייה מקומית (לא OneDrive)'
};

// Element IDs
export const DOM_ELEMENTS = {
    ROOT: 'root'
};

// Sizes
export const SIZES = {
    IMAGE: {
        WIDTH: '400px',
        HEIGHT: '400px'
    },
    INPUT: {
        WIDTH: '60px'
    }
};
