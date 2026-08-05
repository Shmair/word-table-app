// Table/Document constants for WordExport and other components
export const TABLE_CONSTANTS = {
    CELLS_PER_ROW: 2,
    BORDER_SIZE: 25,
    BORDER_STYLE: 'single',
    // A4 (11906 twips) minus the page margins on both sides -> table fills the printable width
    CELL_WIDTH: 5230,
    // Minimum row height ("atLeast"), so a row is the taller of this and its content. Landscape
    // photos are capped by CELL_WIDTH and end up ~260px tall, so this adds a little padding
    // around them; portrait photos exceed it and simply grow the row.
    CELL_HEIGHT: 5400,
    TABLE_WIDTH: 10460,
    MARGINS: {
        LEFT: 10,
        RIGHT: 10,
        TOP: 320,      // padding inside each cell, above the image
        BOTTOM: 160    // and below the number
    },
    COLORS: {
        GREEN: '275114',
        RED: 'C00000',
        BLACK: '000000'
    },
    IMAGE_SIZE: {
        maxWidth: 345,   // px; 5230 twips of cell width is ~348px at 96dpi
        maxHeight: 350   // tallest that still fits two rows plus the heading on one page
    },
    FONT_SIZE: 30,  // 16px ≈ 12pt, docx uses half-points
    TITLE_FONT_SIZE: 64,      // document title (32pt)
    HEADING_FONT_SIZE: 48,    // section headings (24pt)
    PAGE_MARGIN: 720,         // 0.5" page margins (twips)
    SPACING: {
        TITLE_AFTER: 120,
        HEADING_BEFORE: 0,
        HEADING_AFTER: 240,   // breathing room between a section heading and its table
        IMAGE_BEFORE: 60,
        IMAGE_AFTER: 60,
        NUMBER_BEFORE: 60,
        NUMBER_AFTER: 60,
        DATE_AFTER: 120
    }
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

// Proofing language for Word (bidi = complex script / RTL)
export const LANG_HEBREW = { bidi: 'he-IL' };

// Local storage key for persisting table data
export const STORAGE_KEY = 'word-table-app-data';

// The document title is a short string, so it lives in localStorage rather than IndexedDB.
export const TITLE_STORAGE_KEY = 'word-table-app-title';

// Export formats. The value doubles as the file extension.
export const EXPORT_FORMAT = {
    DOCX: 'docx',
    PDF: 'pdf'
};

export const EXPORT_FORMAT_LABELS = {
    [EXPORT_FORMAT.DOCX]: 'Word (docx)',
    [EXPORT_FORMAT.PDF]: 'PDF'
};

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
