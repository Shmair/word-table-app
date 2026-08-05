import { toVisualOrder, containsHebrew } from './bidi';

describe('containsHebrew', () => {
    it('detects Hebrew, and only Hebrew', () => {
        expect(containsHebrew('חתימות')).toBe(true);
        expect(containsHebrew('Signatures')).toBe(false);
        expect(containsHebrew('')).toBe(false);
        expect(containsHebrew(undefined)).toBe(false);
    });
});

describe('toVisualOrder', () => {
    it('reverses a Hebrew word so PDFKit draws it the right way round', () => {
        expect(toVisualOrder('בדיקה')).toBe('הקידב');
    });

    it('keeps the word order of a Hebrew phrase readable right to left', () => {
        // Drawn left to right, this renders as the original "חתימות במחלוקת".
        expect([...toVisualOrder('חתימות במחלוקת')].reverse().join('')).toBe('חתימות במחלוקת');
    });

    it('leaves text without Hebrew untouched', () => {
        expect(toVisualOrder('Signatures 2026')).toBe('Signatures 2026');
        expect(toVisualOrder('#12')).toBe('#12');
    });

    it('does not reverse digits inside Hebrew text', () => {
        // "תיק 42" -- the number must still read 42, not 24.
        expect(toVisualOrder('תיק 42')).toContain('42');
    });

    it('keeps a Latin run readable inside Hebrew text', () => {
        expect(toVisualOrder('תיק ABC')).toContain('ABC');
    });

    it('handles empty and missing input', () => {
        expect(toVisualOrder('')).toBe('');
        expect(toVisualOrder(undefined)).toBe(undefined);
    });

    it('round-trips a single Hebrew letter, as used for signature labels', () => {
        expect(toVisualOrder('א')).toBe('א');
        expect(toVisualOrder('ג')).toBe('ג');
    });
});
