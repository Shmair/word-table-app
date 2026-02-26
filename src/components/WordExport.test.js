import { render, screen, fireEvent } from '@testing-library/react';
import WordExport from './WordExport';

// Mock docx to avoid bundling and canvas dependencies
jest.mock('docx', () => ({
    Document: jest.fn(),
    Packer: {
        toBlob: jest.fn().mockResolvedValue(new Blob(['mock'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
    },
    Paragraph: jest.fn(),
    Table: jest.fn(),
    TableRow: jest.fn(),
    TableCell: jest.fn(),
    TableLayoutType: { FIXED: 'fixed' },
    WidthType: { DXA: 'dxa' },
    TextRun: jest.fn(),
    ImageRun: jest.fn()
}));

describe('WordExport', () => {
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;

    beforeEach(() => {
        window.URL.createObjectURL = jest.fn(() => 'blob:mock');
        window.URL.revokeObjectURL = jest.fn();
        window.alert = jest.fn();
    });

    afterEach(() => {
        window.URL.createObjectURL = originalCreateObjectURL;
        window.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('renders document title input', () => {
        render(<WordExport greenTableData={[]} redTableData={[]} />);
        expect(screen.getByPlaceholderText('שם המסמך')).toBeInTheDocument();
    });

    it('renders export button', () => {
        render(<WordExport greenTableData={[]} redTableData={[]} />);
        expect(screen.getByText('ייצוא ל-Word')).toBeInTheDocument();
    });

    it('shows validation message in title when export not ready', () => {
        const { EXPORT_MESSAGES } = require('../constants');
        render(<WordExport greenTableData={[{ url: 'x', number: 1 }]} redTableData={[{ url: 'y', number: 1 }]} />);
        const btn = screen.getByText('ייצוא ל-Word');
        expect(btn).toHaveAttribute('title', EXPORT_MESSAGES.MISSING_TITLE);
    });

    it('shows alert when export clicked with empty red table', () => {
        const { EXPORT_MESSAGES } = require('../constants');
        render(
            <WordExport
                greenTableData={[{ url: 'data:image/png;base64,abc', number: 1 }]}
                redTableData={[]}
            />
        );
        fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test Doc' } });
        fireEvent.click(screen.getByText('ייצוא ל-Word'));

        expect(window.alert).toHaveBeenCalledWith(EXPORT_MESSAGES.EMPTY_RED_TABLE);
    });

    it('shows alert when export clicked with empty green table', () => {
        const { EXPORT_MESSAGES } = require('../constants');
        render(
            <WordExport
                greenTableData={[]}
                redTableData={[{ url: 'data:image/png;base64,abc', number: 1 }]}
            />
        );
        fireEvent.change(screen.getByPlaceholderText('שם המסמך'), { target: { value: 'Test' } });
        fireEvent.click(screen.getByText('ייצוא ל-Word'));

        expect(window.alert).toHaveBeenCalledWith(EXPORT_MESSAGES.EMPTY_GREEN_TABLE);
    });
});
