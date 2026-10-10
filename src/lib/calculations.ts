import type { IntervalEntry } from '../types/vnstat';


export interface MonthProjectionResult {
  projectedBytes: number;
  burnRatePerDay: number;
  daysElapsed: number;
  daysTotal: number;
  quotaPercent?: number;
  recommendedDailyAllowance?: number;
}

export function calculateMonthProjection(
  currentMonthBytes: number,
  cycleStartDay: number = 1,
  quotaBytes?: number
): MonthProjectionResult {
  const now = new Date();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Calculate days elapsed in current cycle
  let daysElapsed = currentDay - cycleStartDay + 1;
  if (daysElapsed <= 0) {
    daysElapsed += totalDaysInMonth;
  }
  daysElapsed = Math.max(1, Math.min(daysElapsed, totalDaysInMonth));

  const daysRemaining = Math.max(1, totalDaysInMonth - daysElapsed);
  const burnRatePerDay = currentMonthBytes / daysElapsed;
  const projectedBytes = currentMonthBytes + burnRatePerDay * daysRemaining;

  let quotaPercent: number | undefined;
  let recommendedDailyAllowance: number | undefined;

  if (quotaBytes && quotaBytes > 0) {
    quotaPercent = Math.min(100, (currentMonthBytes / quotaBytes) * 100);
    const remainingBudget = Math.max(0, quotaBytes - currentMonthBytes);
    recommendedDailyAllowance = remainingBudget / daysRemaining;
  }

  return {
    projectedBytes,
    burnRatePerDay,
    daysElapsed,
    daysTotal: totalDaysInMonth,
    quotaPercent,
    recommendedDailyAllowance,
  };
}

export function calculateRxTxBalance(rx: number, tx: number) {
  const total = rx + tx;
  if (total === 0) {
    return { rxPercent: 50, txPercent: 50, ratio: 1 };
  }
  const rxPercent = (rx / total) * 100;
  const txPercent = (tx / total) * 100;
  const ratio = tx > 0 ? rx / tx : rx;
  return { rxPercent, txPercent, ratio };
}

/**
 * Builds a 7x24 matrix for network activity.
 * Rows: 0 = Sun, 1 = Mon, ... 6 = Sat
 * Cols: 0 .. 23 hours
 * Values: 0.0 to 1.0 intensity
 */
export function calculateActivityHeatmap(hourlyEntries: IntervalEntry[]): {
  matrix: number[][];
  maxBytes: number;
  dayTotals: number[];
  hourTotals: number[];
} {
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const rawMatrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const dayTotals: number[] = Array(7).fill(0);
  const hourTotals: number[] = Array(24).fill(0);

  let maxBytes = 0;

  for (const entry of hourlyEntries) {
    if (!entry.timestamp || !entry.time) continue;
    // timestamp is in seconds
    const date = new Date(entry.timestamp * 1000);
    const dayOfWeek = date.getDay(); // 0 = Sun .. 6 = Sat
    const hour = entry.time.hour;

    if (dayOfWeek >= 0 && dayOfWeek < 7 && hour >= 0 && hour < 24) {
      const bytes = entry.rx + entry.tx;
      rawMatrix[dayOfWeek][hour] += bytes;
      dayTotals[dayOfWeek] += bytes;
      hourTotals[hour] += bytes;
      if (rawMatrix[dayOfWeek][hour] > maxBytes) {
        maxBytes = rawMatrix[dayOfWeek][hour];
      }
    }
  }

  if (maxBytes > 0) {
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        matrix[d][h] = rawMatrix[d][h] / maxBytes;
      }
    }
  }

  return { matrix, maxBytes, dayTotals, hourTotals };
}
