import { numberToHebrewLetter } from './hebrewNumbers';

describe('numberToHebrewLetter', () => {
    it('converts 1 to א', () => {
        expect(numberToHebrewLetter(1)).toBe('א');
    });

    it('converts 2 to ב', () => {
        expect(numberToHebrewLetter(2)).toBe('ב');
    });

    it('converts 22 to ת', () => {
        expect(numberToHebrewLetter(22)).toBe('ת');
    });

    it('returns number as string when > 22', () => {
        expect(numberToHebrewLetter(23)).toBe('23');
        expect(numberToHebrewLetter(100)).toBe('100');
    });

    it('accepts string input', () => {
        expect(numberToHebrewLetter('5')).toBe('ה');
    });

    it('returns string representation for 0', () => {
        expect(numberToHebrewLetter(0)).toBe('0');
    });

    it('returns string representation for negative numbers', () => {
        expect(numberToHebrewLetter(-1)).toBe('-1');
    });

    it('returns original as string for NaN', () => {
        expect(numberToHebrewLetter('abc')).toBe('abc');
    });

    it('returns empty string for null/undefined', () => {
        expect(numberToHebrewLetter(null)).toBe('');
        expect(numberToHebrewLetter(undefined)).toBe('');
    });
});
