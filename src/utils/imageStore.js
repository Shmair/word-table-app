import { STORAGE_KEY, TITLE_STORAGE_KEY } from '../constants';

// Images are stored as base64 data URLs, and a handful of phone photos blows past the ~5MB
// localStorage quota -- the write throws and the gallery is empty on the next refresh.
// IndexedDB has no comparable limit, so it is the primary store; localStorage stays as a
// fallback for environments without IndexedDB (and as the source for a one-time migration).

const DB_NAME = 'word-table-app';
const DB_VERSION = 1;
const STORE_NAME = 'tables';
const RECORD_KEY = 'current';

const EMPTY = { green: [], red: [] };

const hasIndexedDB = () => typeof indexedDB !== 'undefined' && indexedDB !== null;

const normalize = (value) => ({
    green: Array.isArray(value?.green) ? value.green : [],
    red: Array.isArray(value?.red) ? value.red : []
});

const openDB = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open IndexedDB'));
    request.onblocked = () => reject(new Error('IndexedDB open blocked'));
});

const withStore = (mode, run) => openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const request = run(tx.objectStore(STORE_NAME));
    tx.oncomplete = () => { db.close(); resolve(request?.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('IndexedDB transaction aborted')); };
}));

export const readLocalStorage = () => {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        return cached ? normalize(JSON.parse(cached)) : EMPTY;
    } catch (e) {
        return EMPTY;
    }
};

const writeLocalStorage = (tables) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
        return true;
    } catch (e) {
        // Almost always QuotaExceededError. Drop the key rather than leaving a stale
        // snapshot behind that would load instead of the IndexedDB copy.
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
        return false;
    }
};

export const isEmpty = (tables) => !tables?.green?.length && !tables?.red?.length;

// The document title survives a refresh alongside the images it names.
export const readDocumentTitle = () => {
    try {
        return localStorage.getItem(TITLE_STORAGE_KEY) || '';
    } catch (e) {
        return '';
    }
};

export const saveDocumentTitle = (title) => {
    try {
        if (title) {
            localStorage.setItem(TITLE_STORAGE_KEY, title);
        } else {
            localStorage.removeItem(TITLE_STORAGE_KEY);
        }
        return true;
    } catch (e) {
        return false;
    }
};

export const loadTables = async () => {
    if (hasIndexedDB()) {
        try {
            const stored = await withStore('readonly', (store) => store.get(RECORD_KEY));
            if (stored) return normalize(stored);
        } catch (e) {
            console.warn('IndexedDB read failed, falling back to localStorage:', e);
        }
    }
    return readLocalStorage();
};

export const saveTables = async (tables) => {
    const payload = normalize(tables);

    if (hasIndexedDB()) {
        try {
            await withStore('readwrite', (store) => store.put(payload, RECORD_KEY));
            // Mirror small galleries so the first paint after a refresh is instant; a large
            // one simply won't fit, and IndexedDB already holds the authoritative copy.
            writeLocalStorage(payload);
            return true;
        } catch (e) {
            console.warn('IndexedDB write failed, falling back to localStorage:', e);
        }
    }

    return writeLocalStorage(payload);
};
