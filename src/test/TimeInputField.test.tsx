import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TimeInputField from '../components/TimeInputField/TimeInputField';

function TimeInputFieldHarness({ initialValue = '14:13' }: { initialValue?: string }) {
  const [value, setValue] = React.useState(initialValue);

  return <TimeInputField value={value} onChange={setValue} />;
}

describe('TimeInputField', () => {
  it.each([
    ['14:07', '14:00'],
    ['14:08', '14:15'],
    ['14:13', '14:15'],
    ['14:14', '14:15'],
    ['14:16', '14:15'],
    ['14:22', '14:15'],
    ['14:29', '14:30'],
    ['08:42', '09:00'],
    ['20:42', '20:00'],
    ['23:59', '20:00'],
  ])('rounds and clamps value %s to %s on blur', (initialValue, expectedValue) => {
    render(<TimeInputFieldHarness initialValue={initialValue} />);

    const input = screen.getByRole('textbox');
    fireEvent.blur(input);

    expect(input).toHaveValue(expectedValue);
  });
});
