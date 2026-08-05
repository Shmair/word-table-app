import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileInsert from './FileInsert';
import { TABLE_TYPE, TABLE_LABELS, FILE_INPUT_LABELS } from '../constants';

jest.mock('./WordExport', () => () => <div data-testid="word-export" />);

describe('FileInsert', () => {
    it('renders choose files button', () => {
        const onFileInsert = jest.fn();
        render(
            <FileInsert
                onFileInsert={onFileInsert}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        expect(screen.getByText(FILE_INPUT_LABELS.CHOOSE_FILES)).toBeInTheDocument();
    });

    it('names the table that files will go into, without a picker', () => {
        render(
            <FileInsert
                onFileInsert={jest.fn()}
                greenTableData={[]}
                redTableData={[]}
                tableChoice={TABLE_TYPE.GREEN}
            />
        );

        expect(screen.getByText(TABLE_LABELS.ORIGINAL_SIGNATURES)).toBeInTheDocument();
        expect(screen.queryByText(TABLE_LABELS.DISPUTED_SIGNATURES)).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('has no separate insert step', () => {
        render(
            <FileInsert
                onFileInsert={jest.fn()}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        expect(screen.queryByText('הכנס לטבלה')).not.toBeInTheDocument();
    });

    it('shows no file chosen initially', () => {
        render(
            <FileInsert
                onFileInsert={jest.fn()}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        expect(screen.getByText(FILE_INPUT_LABELS.NO_FILE_CHOSEN)).toBeInTheDocument();
    });

    it('includes WordExport component', () => {
        render(
            <FileInsert
                onFileInsert={jest.fn()}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        expect(screen.getByTestId('word-export')).toBeInTheDocument();
    });

    const chooseFiles = (container, files) => {
        const input = container.querySelector('input[type="file"]');
        fireEvent.change(input, { target: { files } });
        return input;
    };

    it('inserts chosen files into the selected table without a confirm step', async () => {
        const onFileInsert = jest.fn();
        const { container } = render(
            <FileInsert
                onFileInsert={onFileInsert}
                greenTableData={[]}
                redTableData={[]}
                tableChoice={TABLE_TYPE.GREEN}
            />
        );

        chooseFiles(container, [new File(['x'], 'sig.png', { type: 'image/png' })]);

        await waitFor(() => expect(onFileInsert).toHaveBeenCalled());
        const [images, tableType] = onFileInsert.mock.calls[0];
        expect(images).toHaveLength(1);
        expect(images[0].url).toContain('data:');
        expect(tableType).toBe(TABLE_TYPE.GREEN);
    });

    it('inserts dropped files into the selected table', async () => {
        const onFileInsert = jest.fn();
        const { container } = render(
            <FileInsert
                onFileInsert={onFileInsert}
                greenTableData={[]}
                redTableData={[]}
                tableChoice={TABLE_TYPE.RED}
            />
        );

        fireEvent.drop(container.querySelector('.file-input-wrapper'), {
            dataTransfer: { files: [new File(['x'], 'sig.png', { type: 'image/png' })] }
        });

        await waitFor(() => expect(onFileInsert).toHaveBeenCalled());
        expect(onFileInsert.mock.calls[0][1]).toBe(TABLE_TYPE.RED);
    });

    it('clears the file input so the same file can be chosen again', async () => {
        const onFileInsert = jest.fn();
        const { container } = render(
            <FileInsert
                onFileInsert={onFileInsert}
                greenTableData={[]}
                redTableData={[]}
                tableChoice={TABLE_TYPE.GREEN}
            />
        );

        const input = chooseFiles(container, [new File(['x'], 'sig.png', { type: 'image/png' })]);

        await waitFor(() => expect(onFileInsert).toHaveBeenCalled());
        await waitFor(() => expect(input.value).toBe(''));
    });

    it('clears the input after a failed read so the same file can be retried', async () => {
        const onFileInsert = jest.fn();
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const OriginalFileReader = global.FileReader;
        global.FileReader = class {
            readAsDataURL() {
                this.error = new Error('boom');
                setTimeout(() => this.onerror && this.onerror());
            }
        };

        const { container } = render(
            <FileInsert
                onFileInsert={onFileInsert}
                greenTableData={[]}
                redTableData={[]}
                tableChoice={TABLE_TYPE.GREEN}
            />
        );

        const input = chooseFiles(container, [new File(['x'], 'sig.png', { type: 'image/png' })]);

        // The error has to surface, which it cannot while a selection is still showing.
        await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument());
        expect(input.value).toBe('');
        expect(onFileInsert).not.toHaveBeenCalled();

        global.FileReader = OriginalFileReader;
        consoleError.mockRestore();
    });

    it('does nothing when the selection is empty', () => {
        const onFileInsert = jest.fn();
        const { container } = render(
            <FileInsert
                onFileInsert={onFileInsert}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        chooseFiles(container, []);
        expect(onFileInsert).not.toHaveBeenCalled();
    });
});
