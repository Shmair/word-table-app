import { render, screen, fireEvent } from '@testing-library/react';
import RemoveBtn from './RemoveBtn';

describe('RemoveBtn', () => {
    it('renders a button with ×', () => {
        const onClick = jest.fn();
        render(<RemoveBtn onClick={onClick} />);
        expect(screen.getByRole('button', { name: /×/ })).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const onClick = jest.fn();
        render(<RemoveBtn onClick={onClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
