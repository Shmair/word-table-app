import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom 16 (the version react-scripts 5 ships) predates these web globals, but the PDF font
// pipeline reaches for them. Browsers have had them for years; this only fills the test gap.
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
