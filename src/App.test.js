import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

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

    it('renders app title', () => {
        render(<App />);
        expect(screen.getByText('חתימות')).toBeInTheDocument();
    });

    it('renders FileInsert', () => {
        render(<App />);
        expect(screen.getByTestId('file-insert')).toBeInTheDocument();
    });

    it('adds image to green table when onFileInsert called with GREEN', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Add green'));

        expect(screen.getByText('חתימות מקוריות')).toBeInTheDocument();
        expect(screen.getByAltText(/green-0-0/)).toBeInTheDocument();
    });

    it('adds image to red table when onFileInsert called with red', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Add red'));

        expect(screen.getByText('חתימות במחלוקת')).toBeInTheDocument();
        expect(screen.getByAltText(/red-0-0/)).toBeInTheDocument();
    });

    it('persists data to localStorage', () => {
        const { STORAGE_KEY } = require('./constants');
        render(<App />);
        fireEvent.click(screen.getByText('Add green'));

        const cached = localStorage.getItem(STORAGE_KEY);
        expect(cached).toBeTruthy();
        const parsed = JSON.parse(cached);
        expect(parsed.green).toHaveLength(1);
        expect(parsed.green[0].url).toContain('data:image');
    });

    it('loads from localStorage on mount', () => {
        const { STORAGE_KEY } = require('./constants');
        const stored = {
            green: [{ url: 'data:image/png;base64,stored', number: 99 }],
            red: []
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

        render(<App />);

        expect(screen.getByAltText(/green-0-0/)).toBeInTheDocument();
        const input = screen.getAllByRole('spinbutton')[0];
        expect(input).toHaveValue(99);
    });
});
