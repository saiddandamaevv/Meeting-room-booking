import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TimeSlotConflictDialog from '../components/TimeSlotConflictDialog/TimeSlotConflictDialog';

describe('TimeSlotConflictDialog', () => {
  it('shows the conflict message and closes on button click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<TimeSlotConflictDialog open={true} onClose={onClose} />);

    expect(screen.getByText('Время уже занято')).toBeInTheDocument();
    expect(screen.getByText('Выбранный интервал был занят.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Выбрать другое время' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
