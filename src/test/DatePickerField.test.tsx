import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import DatePickerField from '../components/DatePickerField/DatePickerField';

describe('DatePickerField', () => {
  it('renders the selected date label', () => {
    const selectedDate = dayjs('2026-09-08');

    render(<DatePickerField value={selectedDate} onChange={() => undefined} />);

    expect(screen.getByText(/8 сентября/i)).toBeInTheDocument();
  });

  it('opens the calendar when the date field is clicked', () => {
    const selectedDate = dayjs('2026-09-08');

    render(<DatePickerField value={selectedDate} onChange={() => undefined} />);

    fireEvent.click(screen.getByText(/сентября/i));

    expect(screen.getByText(/сентябрь/i)).toBeInTheDocument();
  });

  it('moves to the next month when the arrow is clicked', () => {
    const selectedDate = dayjs('2026-09-08');

    render(<DatePickerField value={selectedDate} onChange={() => undefined} />);
    fireEvent.click(screen.getByText(/сентября/i));

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);

    expect(screen.getByText(/октябрь/i)).toBeInTheDocument();
  });

  it('moves to the previous month when the left arrow is clicked', () => {
    const selectedDate = dayjs('2026-09-08');

    render(<DatePickerField value={selectedDate} onChange={() => undefined} />);
    fireEvent.click(screen.getByText(/сентября/i));

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 2]);

    expect(screen.getByText(/август/i)).toBeInTheDocument();
  });

  it('calls onChange when a valid date is selected', () => {
    const selectedDate = dayjs('2026-09-08');
    const onChange = vi.fn();

    render(<DatePickerField value={selectedDate} onChange={onChange} />);
    fireEvent.click(screen.getByText(/сентября/i));

    const cells = screen.getAllByText('10');
    const candidate = cells.find((node) => node.tagName === 'DIV');

    if (candidate) {
      fireEvent.click(candidate);
    }

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
