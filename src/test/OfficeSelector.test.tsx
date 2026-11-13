import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OfficeSelector from '../components/OfficeSelector/OfficeSelector';
import { getOffices } from '../api/offices';

vi.mock('../api/offices', () => ({
  getOffices: vi.fn(),
}));

type OfficeFixture = {
  id: string;
  name: string;
  address: string;
  timezone: string;
};

const mockOffices: OfficeFixture[] = [
  {
    id: 'office-1',
    name: 'Офис Москва',
    address: 'ул. Лесная, 10',
    timezone: 'Europe/Moscow',
  },
  {
    id: 'office-2',
    name: 'Офис Питер',
    address: 'ул. Невская, 20',
    timezone: 'Europe/Moscow',
  },
];

describe('OfficeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getOffices on mount', async () => {
    vi.mocked(getOffices).mockResolvedValue({ items: mockOffices });

    render(<OfficeSelector onChange={vi.fn()} value="" />);

    expect(getOffices).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Локация не выбрана')).toBeInTheDocument();
  });

  it('renders the list of available offices in the dropdown', async () => {
    vi.mocked(getOffices).mockResolvedValue({ items: mockOffices });
    const user = userEvent.setup();

    render(<OfficeSelector onChange={vi.fn()} value="" />);

    await user.click(await screen.findByRole('combobox'));

    expect(await screen.findByRole('option', { name: 'Офис Москва' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Офис Питер' })).toBeInTheDocument();
  });

  it('shows the selected office name and address when a value is provided', async () => {
    vi.mocked(getOffices).mockResolvedValue({ items: mockOffices });

    render(<OfficeSelector onChange={vi.fn()} value="office-2" />);

    expect(await screen.findByText('Офис Питер')).toBeInTheDocument();
    expect(screen.getByText(/ул\. Невская, 20/i)).toBeInTheDocument();
    expect(screen.getByText(/Часовой пояс: Europe\/Moscow/i)).toBeInTheDocument();
  });

  it('calls onChange when the user selects an office', async () => {
    vi.mocked(getOffices).mockResolvedValue({ items: mockOffices });
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<OfficeSelector onChange={onChange} value="" />);

    await user.click(await screen.findByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Офис Питер' }));

    expect(onChange).toHaveBeenCalledWith('office-2');
  });

  it('renders empty state when the backend returns no offices', async () => {
    vi.mocked(getOffices).mockResolvedValue({ items: [] });

    render(<OfficeSelector onChange={vi.fn()} value="" />);

    expect(await screen.findByText('Локация не выбрана')).toBeInTheDocument();
    expect(screen.getByText('Локация не выбрана')).toBeInTheDocument();
  });

  it('does not crash if the office request fails', async () => {
    vi.mocked(getOffices).mockRejectedValue(new Error('network error'));

    render(<OfficeSelector onChange={vi.fn()} value="" />);

    expect(await screen.findByText('Локация не выбрана')).toBeInTheDocument();
  });
});
