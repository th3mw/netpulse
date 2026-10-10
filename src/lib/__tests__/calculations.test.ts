import { describe, expect, it } from 'bun:test';
import { calculateRxTxBalance, calculateMonthProjection, calculateActivityHeatmap } from '../calculations';

describe('calculations', () => {
  it('calculates RX/TX balance and percentages', () => {
    const { rxPercent, txPercent, ratio } = calculateRxTxBalance(750, 250);
    expect(rxPercent).toBe(75);
    expect(txPercent).toBe(25);
    expect(ratio).toBe(3);
  });

  it('calculates month projection and burn rate', () => {
    const result = calculateMonthProjection(100 * 1000 * 1000 * 1000, 1, 500 * 1000 * 1000 * 1000);
    expect(result.burnRatePerDay).toBeGreaterThan(0);
    expect(result.projectedBytes).toBeGreaterThan(100 * 1000 * 1000 * 1000);
    expect(result.quotaPercent).toBe(20);
  });

  it('builds 7x24 activity heatmap matrix without crashing', () => {
    const hourly = [
      {
        id: 1,
        date: { year: 2026, month: 10, day: 10 },
        time: { hour: 12, minute: 0 },
        timestamp: 1791630000,
        rx: 5000000,
        tx: 2000000,
      },
    ];
    const { matrix, maxBytes } = calculateActivityHeatmap(hourly);
    expect(matrix.length).toBe(7);
    expect(matrix[0].length).toBe(24);
    expect(maxBytes).toBe(7000000);
  });
});
