import { renumberSequentially } from './tableUtils';

describe('renumberSequentially', () => {
    it('labels a list 1..N by position', () => {
        const result = renumberSequentially([{ url: 'a' }, { url: 'b' }, { url: 'c' }]);
        expect(result.map((i) => i.number)).toEqual([1, 2, 3]);
    });

    it('closes gaps left by removals', () => {
        const result = renumberSequentially([
            { url: 'a', number: 1 },
            { url: 'b', number: 2 },
            { url: 'c', number: 5 }
        ]);
        expect(result.map((i) => i.number)).toEqual([1, 2, 3]);
    });

    it('keeps every other field intact', () => {
        const [item] = renumberSequentially([{ url: 'a', number: 9, rotation: 90 }]);
        expect(item).toEqual({ url: 'a', number: 1, rotation: 90 });
    });

    it('does not mutate the input', () => {
        const input = [{ url: 'a', number: 7 }];
        renumberSequentially(input);
        expect(input[0].number).toBe(7);
    });

    it('passes empty slots through untouched', () => {
        expect(renumberSequentially([null, { url: 'a' }])).toEqual([null, { url: 'a', number: 2 }]);
    });

    it('handles an empty list', () => {
        expect(renumberSequentially([])).toEqual([]);
    });
});
