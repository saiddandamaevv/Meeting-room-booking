import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { fromMskToUtc, fromUtcToMsk, TIMEZONE_MSK } from '../utils/time';

describe('time utils', () => {
  it.each([
    ['2026-09-08 00:00', '2026-09-07T21:00:00.000Z'],
    ['2026-09-08 03:00', '2026-09-08T00:00:00.000Z'],
    ['2026-09-08 09:00', '2026-09-08T06:00:00.000Z'],
    ['2026-09-08 12:00', '2026-09-08T09:00:00.000Z'],
    ['2026-09-08 15:00', '2026-09-08T12:00:00.000Z'],
    ['2026-09-08 20:00', '2026-09-08T17:00:00.000Z'],
  ])('converts Moscow time %s to UTC', (mskDateTime, expectedUtc) => {
    const msk = dayjs.tz(mskDateTime, TIMEZONE_MSK);

    expect(fromMskToUtc(msk)).toBe(expectedUtc);
  });

  it.each([
    ['2026-09-07T21:00:00.000Z', '2026-09-08 00:00'],
    ['2026-09-08T00:00:00.000Z', '2026-09-08 03:00'],
    ['2026-09-08T06:00:00.000Z', '2026-09-08 09:00'],
    ['2026-09-08T09:00:00.000Z', '2026-09-08 12:00'],
    ['2026-09-08T12:00:00.000Z', '2026-09-08 15:00'],
    ['2026-09-08T17:00:00.000Z', '2026-09-08 20:00'],
  ])('converts UTC %s to Moscow time', (utcValue, expectedLocal) => {
    expect(fromUtcToMsk(utcValue).format('YYYY-MM-DD HH:mm')).toBe(expectedLocal);
  });
});
