import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// App loads its gallery asynchronously, so mounting queues state updates that land after the
// test body would otherwise have finished -- React reports those as unwrapped act() updates.
// Flushing the pending microtasks inside act() settles the load before we assert.
const renderApp = async () => {
    const result = render(<App />);
    await act(async () => {});
    return result;
};

jest.mock('./components/FileInsert', () => (props) => (
    <div data-testid="file-insert">
        <button onClick={() => props.onFileInsert([{ url: 'data:image/png;base64,x', number: 1 }], 'GREEN')}>
            Add green
        </button>
        <button onClick={() => props.onFileInsert([{ url: 'data:image/png;base64,y', number: 1 }], 'red')}>
            Add red
        </button>
    </div>
));

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    // Inline restores are skipped when an assertion throws, which leaks mocks into later tests.
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders app title', async () => {
        await renderApp();
        expect(screen.getByText('חתימות')).toBeInTheDocument();
    });

    it('renders FileInsert', async () => {
        await renderApp();
        expect(screen.getByTestId('file-insert')).toBeInTheDocument();
    });

    it('adds image to green table when onFileInsert called with GREEN', async () => {
        await renderApp();
        fireEvent.click(screen.getByText('Add green'));

        expect(screen.getByText('חתימות מקוריות')).toBeInTheDocument();
        expect(screen.getByAltText(/green-0-0/)).toBeInTheDocument();
    });

    it('adds image to red table when onFileInsert called with red', async () => {
        await renderApp();
        fireEvent.click(screen.getByText('Add red'));

        expect(screen.getByText('חתימות במחלוקת')).toBeInTheDocument();
        expect(screen.getByAltText(/red-0-0/)).toBeInTheDocument();
    });

    it('persists data to localStorage', async () => {
        const { STORAGE_KEY } = require('./constants');
        await renderApp();
        fireEvent.click(screen.getByText('Add green'));

        await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy());
        const cached = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(cached);
        expect(parsed.green).toHaveLength(1);
        expect(parsed.green[0].url).toContain('data:image');
    });

    it('loads from localStorage on mount', async () => {
        const { STORAGE_KEY } = require('./constants');
        const stored = {
            green: [{ url: 'data:image/png;base64,stored', number: 99 }],
            red: []
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

        await renderApp();

        expect(screen.getByAltText(/green-0-0/)).toBeInTheDocument();
        // Labels are positional, so a stored 99 normalises to the first slot.
        const input = screen.getAllByRole('spinbutton')[0];
        expect(input).toHaveValue(1);
    });

    it('numbers images 1..N with no gaps after images are added', async () => {
        await renderApp();
        fireEvent.click(screen.getByText('Add green'));
        fireEvent.click(screen.getByText('Add green'));
        fireEvent.click(screen.getByText('Add green'));

        const numbers = screen.getAllByRole('spinbutton').map((i) => i.value);
        expect(numbers).toEqual(['1', '2', '3']);
    });

    it('does not let a late load discard images added while it was in flight', async () => {
        const { STORAGE_KEY } = require('./constants');
        // Nothing to seed from synchronously; the stored copy arrives only via loadTables.
        const store = require('./utils/imageStore');
        let release;
        const pending = new Promise((resolve) => { release = resolve; });
        jest.spyOn(store, 'loadTables').mockReturnValue(pending);
        jest.spyOn(store, 'readLocalStorage').mockReturnValue({ green: [], red: [] });

        await renderApp();
        fireEvent.click(screen.getByText('Add green'));
        expect(screen.getByAltText(/green-0-0/)).toBeInTheDocument();

        await act(async () => {
            release({ green: [{ url: 'data:image/png;base64,old', number: 1 }], red: [] });
        });
        await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy());

        // The image added a moment ago must still be there, not replaced by the stored one.
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        expect(stored.green).toHaveLength(1);
        expect(stored.green[0].url).toBe('data:image/png;base64,x');
    });

    it('closes the gap left by a stored image that was removed', async () => {
        const { STORAGE_KEY } = require('./constants');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            green: [
                { url: 'data:image/png;base64,a', number: 1 },
                { url: 'data:image/png;base64,b', number: 2 },
                { url: 'data:image/png;base64,c', number: 5 }
            ],
            red: []
        }));

        await renderApp();

        const numbers = screen.getAllByRole('spinbutton').map((i) => i.value);
        expect(numbers).toEqual(['1', '2', '3']);
    });
});
