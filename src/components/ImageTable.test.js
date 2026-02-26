import { render, screen, fireEvent } from '@testing-library/react';
import ImageTable from './ImageTable';
import { COLORS, TABLE_LABELS } from '../constants';

const mockData = [
    { url: 'data:image/png;base64,abc', number: 1 },
    { url: 'data:image/png;base64,def', number: 2 }
];

describe('ImageTable', () => {
    it('renders table with correct label for green', () => {
        const onSort = jest.fn();
        const onRemoveImage = jest.fn();
        const onUpdateImage = jest.fn();
        const onUpdateImageNumber = jest.fn();

        render(
            <ImageTable
                data={mockData}
                color={COLORS.GREEN}
                onSort={onSort}
                onRemoveImage={onRemoveImage}
                onUpdateImage={onUpdateImage}
                onUpdateImageNumber={onUpdateImageNumber}
            />
        );

        expect(screen.getByText(TABLE_LABELS.ORIGINAL_SIGNATURES)).toBeInTheDocument();
    });

    it('renders table with correct label for red', () => {
        render(
            <ImageTable
                data={mockData}
                color={COLORS.RED}
                onSort={jest.fn()}
                onRemoveImage={jest.fn()}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={jest.fn()}
            />
        );

        expect(screen.getByText(TABLE_LABELS.DISPUTED_SIGNATURES)).toBeInTheDocument();
    });

    it('renders sort button', () => {
        render(
            <ImageTable
                data={mockData}
                color={COLORS.GREEN}
                onSort={jest.fn()}
                onRemoveImage={jest.fn()}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={jest.fn()}
            />
        );

        expect(screen.getByText('סדר לפי מספר')).toBeInTheDocument();
    });

    it('calls onSort when sort button clicked', () => {
        const onSort = jest.fn();
        render(
            <ImageTable
                data={mockData}
                color={COLORS.GREEN}
                onSort={onSort}
                onRemoveImage={jest.fn()}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={jest.fn()}
            />
        );

        fireEvent.click(screen.getByText('סדר לפי מספר'));
        expect(onSort).toHaveBeenCalledWith([0, 1]);
    });

    it('sort button is disabled when data is empty', () => {
        render(
            <ImageTable
                data={[]}
                color={COLORS.GREEN}
                onSort={jest.fn()}
                onRemoveImage={jest.fn()}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={jest.fn()}
            />
        );

        expect(screen.getByText('סדר לפי מספר').closest('button')).toBeDisabled();
    });

    it('calls onUpdateImageNumber when number input changes', () => {
        const onUpdateImageNumber = jest.fn();
        render(
            <ImageTable
                data={mockData}
                color={COLORS.GREEN}
                onSort={jest.fn()}
                onRemoveImage={jest.fn()}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={onUpdateImageNumber}
            />
        );

        const inputs = screen.getAllByRole('spinbutton');
        fireEvent.change(inputs[0], { target: { value: '5' } });
        expect(onUpdateImageNumber).toHaveBeenCalledWith(0, 5);
    });

    it('does not call onUpdateImageNumber for invalid number', () => {
        const onUpdateImageNumber = jest.fn();
        render(
            <ImageTable
                data={mockData}
                color={COLORS.GREEN}
                onSort={jest.fn()}
                onRemoveImage={jest.fn()}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={onUpdateImageNumber}
            />
        );

        const inputs = screen.getAllByRole('spinbutton');
        fireEvent.change(inputs[0], { target: { value: '0' } });
        fireEvent.change(inputs[0], { target: { value: '-1' } });
        fireEvent.change(inputs[0], { target: { value: 'abc' } });
        expect(onUpdateImageNumber).not.toHaveBeenCalled();
    });

    it('renders remove buttons for each image', () => {
        const onRemoveImage = jest.fn();
        render(
            <ImageTable
                data={mockData}
                color={COLORS.GREEN}
                onSort={jest.fn()}
                onRemoveImage={onRemoveImage}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={jest.fn()}
            />
        );

        const removeButtons = screen.getAllByRole('button').filter(b => b.textContent === '×');
        expect(removeButtons).toHaveLength(2);

        fireEvent.click(removeButtons[0]);
        expect(onRemoveImage).toHaveBeenCalledWith(0);
    });
});
