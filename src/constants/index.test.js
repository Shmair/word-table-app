import {
    TABLE_CONSTANTS,
    TABLE_TYPE,
    TABLE_LABELS,
    COLORS,
    STORAGE_KEY,
    FILE_INPUT_LABELS,
    STYLES,
    SIZES,
    EXPORT_MESSAGES,
    LANG_HEBREW
} from './index';

describe('constants', () => {
    describe('TABLE_CONSTANTS', () => {
        it('has expected structure', () => {
            expect(TABLE_CONSTANTS.CELLS_PER_ROW).toBe(2);
            expect(TABLE_CONSTANTS.BORDER_SIZE).toBe(25);
            expect(TABLE_CONSTANTS.CELL_WIDTH).toBe(5230);
            expect(TABLE_CONSTANTS.TABLE_WIDTH).toBe(10460);
        });
        it('sizes the table to fill the printable width of an A4 page', () => {
            const A4_WIDTH = 11906;
            const printable = A4_WIDTH - 2 * TABLE_CONSTANTS.PAGE_MARGIN;
            expect(TABLE_CONSTANTS.TABLE_WIDTH).toBeLessThanOrEqual(printable);
            expect(TABLE_CONSTANTS.TABLE_WIDTH).toBeGreaterThan(printable - 100);
            expect(TABLE_CONSTANTS.CELL_WIDTH * TABLE_CONSTANTS.CELLS_PER_ROW).toBe(TABLE_CONSTANTS.TABLE_WIDTH);
        });
        it('has color hex values', () => {
            expect(TABLE_CONSTANTS.COLORS.GREEN).toBe('275114');
            expect(TABLE_CONSTANTS.COLORS.RED).toBe('C00000');
        });
        it('has image size limits', () => {
            expect(TABLE_CONSTANTS.IMAGE_SIZE.maxWidth).toBe(345);
            expect(TABLE_CONSTANTS.IMAGE_SIZE.maxHeight).toBe(350);
        });
        it('fills the page height without spilling a second page', () => {
            const A4_HEIGHT = 16838;
            const TWIPS_PER_PX = 15;
            const halfPointsToTwips = (hp) => hp * 10;
            const { SPACING: S, MARGINS: M } = TABLE_CONSTANTS;

            const printable = A4_HEIGHT - 2 * TABLE_CONSTANTS.PAGE_MARGIN;
            const content = TABLE_CONSTANTS.IMAGE_SIZE.maxHeight * TWIPS_PER_PX
                + M.TOP + M.BOTTOM
                + S.IMAGE_BEFORE + S.IMAGE_AFTER
                + S.NUMBER_BEFORE + S.NUMBER_AFTER
                + halfPointsToTwips(TABLE_CONSTANTS.FONT_SIZE);
            // CELL_HEIGHT is an "atLeast" rule: the row is the taller of the two.
            const rowHeight = Math.max(TABLE_CONSTANTS.CELL_HEIGHT, content);
            const heading = halfPointsToTwips(TABLE_CONSTANTS.FONT_SIZE) + S.DATE_AFTER
                + halfPointsToTwips(TABLE_CONSTANTS.TITLE_FONT_SIZE) + S.TITLE_AFTER
                + halfPointsToTwips(TABLE_CONSTANTS.HEADING_FONT_SIZE) + S.HEADING_AFTER;

            // Worst case is a portrait photo, which hits maxHeight and grows the row.
            const used = 2 * rowHeight + heading;
            expect(used).toBeLessThanOrEqual(printable);
            // ...and large enough that the page is not left half empty
            expect(used).toBeGreaterThan(printable * 0.85);
        });

        it('pads a landscape photo without stranding it in a huge cell', () => {
            const TWIPS_PER_PX = 15;
            const { MARGINS: M, SPACING: S } = TABLE_CONSTANTS;
            // A 4:3 landscape photo is limited by the cell width, not maxHeight.
            const landscapeBlock = (TABLE_CONSTANTS.IMAGE_SIZE.maxWidth * 3 / 4) * TWIPS_PER_PX
                + M.TOP + M.BOTTOM
                + S.IMAGE_BEFORE + S.IMAGE_AFTER
                + S.NUMBER_BEFORE + S.NUMBER_AFTER
                + TABLE_CONSTANTS.FONT_SIZE * 10;

            // Some slack, so the border does not sit flush against the picture...
            expect(TABLE_CONSTANTS.CELL_HEIGHT).toBeGreaterThan(landscapeBlock);
            // ...but not so much that the photo floats in a mostly empty box.
            expect(TABLE_CONSTANTS.CELL_HEIGHT).toBeLessThan(landscapeBlock * 1.25);
        });

        it('keeps images inside the cell they sit in', () => {
            const TWIPS_PER_PX = 15;   // 1440 twips per inch / 96 px per inch
            expect(TABLE_CONSTANTS.IMAGE_SIZE.maxWidth * TWIPS_PER_PX).toBeLessThan(TABLE_CONSTANTS.CELL_WIDTH);
            expect(TABLE_CONSTANTS.IMAGE_SIZE.maxHeight * TWIPS_PER_PX).toBeLessThan(TABLE_CONSTANTS.CELL_HEIGHT);
        });
    });

    describe('TABLE_TYPE', () => {
        it('defines GREEN and RED', () => {
            expect(TABLE_TYPE.GREEN).toBe('GREEN');
            expect(TABLE_TYPE.RED).toBe('red');
        });
    });

    describe('TABLE_LABELS', () => {
        it('has Hebrew labels', () => {
            expect(TABLE_LABELS.ORIGINAL_SIGNATURES).toBe('חתימות מקוריות');
            expect(TABLE_LABELS.DISPUTED_SIGNATURES).toBe('חתימות במחלוקת');
        });
    });

    describe('COLORS', () => {
        it('has display colors', () => {
            expect(COLORS.RED).toBe('red');
            expect(COLORS.GREEN).toBe('green');
        });
    });

    describe('STORAGE_KEY', () => {
        it('is a non-empty string', () => {
            expect(typeof STORAGE_KEY).toBe('string');
            expect(STORAGE_KEY.length).toBeGreaterThan(0);
        });
    });

    describe('FILE_INPUT_LABELS', () => {
        it('has static labels', () => {
            expect(FILE_INPUT_LABELS.CHOOSE_FILES).toBe('בחר קבצים');
            expect(FILE_INPUT_LABELS.NO_FILE_CHOSEN).toBe('לא נבחר קובץ');
        });
        it('FILES_SELECTED is a function', () => {
            expect(typeof FILE_INPUT_LABELS.FILES_SELECTED).toBe('function');
            expect(FILE_INPUT_LABELS.FILES_SELECTED(3)).toBe('3 קבצים נבחרו');
        });
    });

    describe('STYLES', () => {
        it('has padding values', () => {
            expect(STYLES.PADDING.DEFAULT).toBe('20px');
            expect(STYLES.PADDING.TINY).toBe('5px');
        });
    });

    describe('SIZES', () => {
        it('has image dimensions', () => {
            expect(SIZES.IMAGE.WIDTH).toBe('400px');
            expect(SIZES.IMAGE.HEIGHT).toBe('400px');
        });
    });

    describe('EXPORT_MESSAGES', () => {
        it('has Hebrew validation messages', () => {
            expect(EXPORT_MESSAGES.MISSING_TITLE).toBe('נא להזין שם מסמך');
            expect(EXPORT_MESSAGES.MISSING_IMAGES).toBe('נא למלא לפחות טבלה אחת בתמונות');
        });
    });

    describe('LANG_HEBREW', () => {
        it('sets bidi to he-IL for Word proofing', () => {
            expect(LANG_HEBREW.bidi).toBe('he-IL');
        });
    });
});
