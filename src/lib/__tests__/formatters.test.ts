import { describe, expect, it } from 'bun:test';
import { formatBytes, formatRate, formatPackets, formatDate, formatTime } from '../formatters';

describe('formatters', () => {
  it('formats SI bytes correctly', () => {
    expect(formatBytes(0, 'SI')).toBe('0 B');
    expect(formatBytes(1000, 'SI')).toBe('1.00 KB');
    expect(formatBytes(1500000, 'SI')).toBe('1.50 MB');
    expect(formatBytes(2500000000, 'SI')).toBe('2.50 GB');
  });

  it('formats IEC bytes correctly', () => {
    expect(formatBytes(1024, 'IEC')).toBe('1.00 KiB');
    expect(formatBytes(1048576 * 2.5, 'IEC')).toBe('2.50 MiB');
  });

  it('formats Bits rate correctly', () => {
    expect(formatRate(125000, 'BITS')).toBe('1.0 Mbit/s'); // 125,000 bytes = 1,000,000 bits
  });

  it('formats packets correctly', () => {
    expect(formatPackets(450)).toBe('450 pps');
    expect(formatPackets(12500)).toBe('12.5 kpps');
    expect(formatPackets(1500000)).toBe('1.5 Mpps');
  });

  it('formats dates and times', () => {
    expect(formatDate({ year: 2026, month: 10, day: 10 })).toBe('2026-10-10');
    expect(formatDate({ year: 2026, month: 8 })).toBe('2026-08');
    expect(formatTime({ hour: 9, minute: 5 })).toBe('09:05');
  });
});
