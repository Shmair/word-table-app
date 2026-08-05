import { loadTables, saveTables, isEmpty } from './imageStore';
import { STORAGE_KEY } from '../constants';

// Minimal in-memory stand-in for IndexedDB -- jsdom ships none, and the whole point of the
// store is that it keeps working when localStorage is over quota.
const installFakeIndexedDB = () => {
    const data = new Map();
    const fire = (target, prop) => setTimeout(() => target[prop] && target[prop]());

    global.indexedDB = {
        open: () => {
            const request = { result: null, error: null };
            setTimeout(() => {
                request.result = {
                    objectStoreNames: { contains: () => true },
                    createObjectStore: () => {},
                    close: () => {},
                    transaction: () => {
                        const tx = {};
                        const store = {
                            get: (key) => {
                                const r = { result: data.get(key) };
                                fire(tx, 'oncomplete');
                                return r;
                            },
                            put: (value, key) => {
                                data.set(key, value);
                                fire(tx, 'oncomplete');
                                return {};
                            }
                        };
                        tx.objectStore = () => store;
                        return tx;
                    }
                };
                request.onsuccess && request.onsuccess();
            });
            return request;
        }
    };
    return data;
};

describe('imageStore', () => {
    const originalIndexedDB = global.indexedDB;
    const bigGallery = {
        green: [{ url: 'data:image/jpeg;base64,' + 'A'.repeat(64), number: 1 }],
        red: []
    };

    afterEach(() => {
        global.indexedDB = originalIndexedDB;
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('round-trips through IndexedDB', async () => {
        installFakeIndexedDB();

        await saveTables(bigGallery);
        const loaded = await loadTables();

        expect(loaded.green).toHaveLength(1);
        expect(loaded.green[0].number).toBe(1);
    });

    it('keeps images when localStorage is over quota', async () => {
        installFakeIndexedDB();
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            const err = new Error('quota');
            err.name = 'QuotaExceededError';
            throw err;
        });

        const saved = await saveTables(bigGallery);
        expect(saved).toBe(true);

        // localStorage rejected the write, but the gallery still comes back.
        const loaded = await loadTables();
        expect(loaded.green).toHaveLength(1);
    });

    it('does not leave a stale localStorage snapshot behind after a quota failure', async () => {
        installFakeIndexedDB();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ green: [{ url: 'stale', number: 7 }], red: [] }));
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            const err = new Error('quota');
            err.name = 'QuotaExceededError';
            throw err;
        });

        await saveTables(bigGallery);

        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('falls back to localStorage when IndexedDB is unavailable', async () => {
        delete global.indexedDB;

        const saved = await saveTables(bigGallery);
        expect(saved).toBe(true);
        expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();

        const loaded = await loadTables();
        expect(loaded.green).toHaveLength(1);
    });

    it('reports empty galleries', () => {
        expect(isEmpty({ green: [], red: [] })).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty(bigGallery)).toBe(false);
    });
});
