/**
 * Converts a number to Hebrew letter (1-22 → א-ת) for display in disputed signatures table.
 * Numbers > 22 are returned as string.
 */
export const numberToHebrewLetter = (n) => {
    const num = typeof n === 'number' ? n : parseInt(n, 10);
    if (isNaN(num) || num < 1) return String(n ?? '');
    const alefBet = 'אבגדהוזחטיכלמנסעפצקרשת';
    if (num <= 22) return alefBet[num - 1];
    return String(num);
};
