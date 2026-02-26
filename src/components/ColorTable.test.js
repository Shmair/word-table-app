import { render, screen } from '@testing-library/react';
import ColorTable from './ColorTable';
import { COLORS, TABLE_LABELS } from '../constants';

jest.mock('./ImageTable', () => (props) => (
    <div data-testid="image-table">
        <span data-testid="color">{props.color}</span>
        <span data-testid="data-length">{props.data?.length ?? 0}</span>
    </div>
));

describe('ColorTable', () => {
    it('passes data and color to ImageTable', () => {
        const data = [{ url: 'x', number: 1 }];
        render(
            <ColorTable
                data={data}
                color={COLORS.GREEN}
                onSort={jest.fn()}
                onRemoveImage={jest.fn()}
                onUpdateImage={jest.fn()}
                onUpdateImageNumber={jest.fn()}
            />
        );

        expect(screen.getByTestId('image-table')).toBeInTheDocument();
        expect(screen.getByTestId('color')).toHaveTextContent(COLORS.GREEN);
        expect(screen.getByTestId('data-length')).toHaveTextContent('1');
    });
});
