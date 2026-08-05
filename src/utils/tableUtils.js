// Signature numbers are exhibit labels (א, ב, ג ...), so they have to read 1..N with no gaps.
// Deriving them from max(existing) + 1 leaves holes as soon as an image is removed -- the
// fourth image added to a table that has had one deleted comes out as ה instead of ג.
export function renumberSequentially(list) {
    return list.map((item, index) => (item ? { ...item, number: index + 1 } : item));
}
