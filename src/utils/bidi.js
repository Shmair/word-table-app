// PDFKit draws glyphs in the order given -- it has no bidi algorithm, so Hebrew handed to it
// straight comes out mirrored ("קודב" instead of "בדוק"). This reorders a string into visual
// order: runs are laid out right to left, and the characters inside a Hebrew run are reversed,
// while Latin/digit runs keep their own order ("2 טקסט" stays "2" not "2" reversed).
// Enough for headings and labels; it is not a full UAX #9 implementation.

const HEBREW = /[֐-׿יִ-ﭏ]/;
const NEUTRAL = /[\s.,:;!?'"()[\]{}\-–—/\\|]/;

const isHebrew = (ch) => HEBREW.test(ch);
const isNeutral = (ch) => NEUTRAL.test(ch);

export const containsHebrew = (text) => HEBREW.test(text || '');

export const toVisualOrder = (text) => {
    if (!text || !containsHebrew(text)) return text;

    // Split into runs of the same direction; neutrals join the run they follow.
    const runs = [];
    let current = null;
    for (const ch of text) {
        const dir = isHebrew(ch) ? 'rtl' : isNeutral(ch) ? (current?.dir ?? 'rtl') : 'ltr';
        if (!current || current.dir !== dir) {
            current = { dir, text: ch };
            runs.push(current);
        } else {
            current.text += ch;
        }
    }

    return runs
        .reverse()
        .map((run) => (run.dir === 'rtl' ? [...run.text].reverse().join('') : run.text))
        .join('');
};
