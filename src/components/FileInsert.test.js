import { render, screen, fireEvent } from '@testing-library/react';
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

    it('renders table selector with both options', () => {
        render(
            <FileInsert
                onFileInsert={jest.fn()}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        expect(screen.getByText(TABLE_LABELS.DISPUTED_SIGNATURES)).toBeInTheDocument();
        expect(screen.getByText(TABLE_LABELS.ORIGINAL_SIGNATURES)).toBeInTheDocument();
    });

    it('renders insert button', () => {
        render(
            <FileInsert
                onFileInsert={jest.fn()}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        expect(screen.getByText('הכנס לטבלה')).toBeInTheDocument();
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

    it('calls alert when insert clicked with no files', () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        render(
            <FileInsert
                onFileInsert={jest.fn()}
                greenTableData={[]}
                redTableData={[]}
            />
        );

        fireEvent.click(screen.getByText('הכנס לטבלה'));
        expect(alertSpy).toHaveBeenCalledWith('בחר קבצים תחילה');

        alertSpy.mockRestore();
    });
});
