import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Activity,
  Calendar,
  Gauge,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { formatBytes, formatDateTime } from '../lib/formatters';
import { calculateMonthProjection, calculateRxTxBalance } from '../lib/calculations';
import type { IntervalEntry } from '../types/vnstat';

export const OverviewView: React.FC = () => {
  const {
    selectedInterface,
    vnstatData,
    percentileReport,
    unitPreference,
    billingConfig,
  } = useNetworkStore();

  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const total = iface?.traffic.total || { rx: 0, tx: 0 };
  const days: IntervalEntry[] = iface?.traffic.day || [];
  const hours: IntervalEntry[] = iface?.traffic.hour || [];
  const months: IntervalEntry[] = iface?.traffic.month || [];
  const topDays: IntervalEntry[] = iface?.traffic.top || [];

  const today = days[days.length - 1] || { rx: 0, tx: 0 };
  const yesterday = days.length > 1 ? days[days.length - 2] : null;

  const todayTotal = today.rx + today.tx;
  const yesterdayTotal = yesterday ? yesterday.rx + yesterday.tx : 0;
  const dayDelta = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;

  // Monthly projection
  const currentMonth = months[months.length - 1] || { rx: 0, tx: 0 };
  const currentMonthTotal = currentMonth.rx + currentMonth.tx;
  const projection = calculateMonthProjection(
    currentMonthTotal,
    billingConfig.cycleStartDay,
    billingConfig.enabled ? billingConfig.monthlyQuotaBytes : undefined
  );

  // Balance
  const balance = calculateRxTxBalance(total.rx, total.tx);

  // Peak 24-hour hour
  const peakHour = hours.reduce(
    (max: IntervalEntry, h: IntervalEntry) => (h.rx + h.tx > max.rx + max.tx ? h : max),
    hours[0] || ({ rx: 0, tx: 0, time: { hour: 0, minute: 0 } } as IntervalEntry)
  );

  return (
    <div className="space-y-6">
      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Traffic"
          value={formatBytes(todayTotal, unitPreference)}
          subValue={`RX: ${formatBytes(today.rx, unitPreference)} • TX: ${formatBytes(today.tx, unitPreference)}`}
          trend={
            yesterdayTotal > 0
              ? {
                  label: `${dayDelta >= 0 ? '+' : ''}${dayDelta.toFixed(1)}% vs yday`,
                  positive: dayDelta <= 0,
                }
              : undefined
          }
          icon={<Calendar className="w-4 h-4 text-cyan-400" />}
          accentColor="cyan"
          badge="24h"
          helpTitle="Today's Traffic"
          helpContent="Cumulative bandwidth transferred across this network interface since 00:00 local time today."
          helpFormula="RX_today + TX_today"
        />

        <MetricCard
          title="Month Run-Rate"
          value={formatBytes(projection.projectedBytes, unitPreference)}
          subValue={`Actual MTD: ${formatBytes(currentMonthTotal, unitPreference)}`}
          icon={<Activity className="w-4 h-4" />}
          accentColor="primary"
          badge="Forecast"
          helpTitle="Month Run-Rate Forecast"
          helpContent="Estimated total volume by the end of the billing cycle based on your current daily consumption rate."
          helpFormula="used_bytes + (daily_burn * days_remaining)"
        />

        <MetricCard
          title="95th Percentile Burst"
          value={percentileReport?.total_95th_str || 'Calculating...'}
          subValue={`RX: ${percentileReport?.rx_95th_str || '-'} • TX: ${percentileReport?.tx_95th_str || '-'}`}
          icon={<Gauge className="w-4 h-4" />}
          accentColor="tx"
          badge="ISP Billing"
          helpTitle="95th Percentile Bandwidth"
          helpContent="Burstable billing rate used by transit providers: top 5% peak spikes are discarded, leaving the 95th percentile sustained rate."
          helpFormula="Ranked_Samples[ceil(0.95 * N)]"
        />

        <MetricCard
          title="All-Time Total"
          value={formatBytes(total.rx + total.tx, unitPreference)}
          subValue={`RX: ${formatBytes(total.rx, unitPreference)} • TX: ${formatBytes(total.tx, unitPreference)}`}
          icon={<HardDrive className="w-4 h-4" />}
          accentColor="rx"
          badge="Cumulative"
          helpTitle="All-Time Lifetime Traffic"
          helpContent="Grand total of all bytes transferred through this network card since vnstat began logging."
          helpFormula="Total_RX + Total_TX"
        />
      </div>

      {/* Middle Section: Quota Card + Traffic Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Quota Meter */}
        <GlassCard className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Monthly Quota & Burn Rate</h3>
                  <HelpTooltip
                    title="Quota & Burn Rate"
                    content="Tracks your data cap usage against your billing renewal day. Warns before overage charges and suggests maximum daily burn allowance."
                    formula="(monthly_used / quota_cap) * 100%"
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Cycle day {projection.daysElapsed} of {projection.daysTotal} (Resets on day{' '}
                  {billingConfig.cycleStartDay})
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
              <span>{projection.daysTotal - projection.daysElapsed} days remaining</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>
                Used:{' '}
                <strong className="font-mono" style={{ color: 'var(--text-main)' }}>
                  {formatBytes(currentMonthTotal, unitPreference)}
                </strong>
              </span>
              <span>
                Limit:{' '}
                <strong className="font-mono" style={{ color: 'var(--text-main)' }}>
                  {formatBytes(billingConfig.monthlyQuotaBytes, unitPreference)}
                </strong>
              </span>
            </div>

            <div
              className="h-3 w-full rounded-full overflow-hidden p-0.5 border relative"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, projection.quotaPercent || 0)}%`,
                  backgroundColor:
                    (projection.quotaPercent || 0) > 90
                      ? 'var(--accent-tx)'
                      : (projection.quotaPercent || 0) > 75
                      ? 'color-mix(in srgb, var(--accent-primary) 50%, var(--accent-tx))'
                      : 'var(--accent-primary)',
                }}
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                {(projection.quotaPercent || 0) > 85 ? (
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--accent-tx)' }} />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-rx)' }} />
                )}
                <span>
                  Quota used: <strong style={{ color: 'var(--text-main)' }}>{(projection.quotaPercent || 0).toFixed(1)}%</strong>
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Daily Budget Remaining:{' '}
                <strong className="font-mono" style={{ color: 'var(--accent-primary)' }}>
                  {formatBytes(projection.recommendedDailyAllowance || 0, unitPreference)}/day
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-dim)' }}>Daily Burn Rate</span>
              <div className="text-sm font-semibold font-mono mt-0.5" style={{ color: 'var(--text-main)' }}>
                {formatBytes(projection.burnRatePerDay, unitPreference)}/day
              </div>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-dim)' }}>Busiest Hour</span>
              <div className="text-sm font-semibold font-mono mt-0.5" style={{ color: 'var(--text-main)' }}>
                {peakHour?.time ? `${peakHour.time.hour}:00` : '-'} (
                {formatBytes((peakHour?.rx || 0) + (peakHour?.tx || 0), unitPreference)})
              </div>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-dim)' }}>All-Time Peak Day</span>
              <div className="text-sm font-semibold font-mono mt-0.5 truncate" style={{ color: 'var(--text-main)' }}>
                {topDays[0]
                  ? `${topDays[0].date.year}-${topDays[0].date.month}-${topDays[0].date.day}`
                  : '-'}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Traffic Balance (RX vs TX) */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Traffic Symmetry</h3>
              <HelpTooltip
                title="Traffic Symmetry (RX vs TX)"
                content="Compares inbound download volume (RX) to outbound upload volume (TX). Most home connections are heavily download-skewed (3:1 to 10:1)."
                formula="Ratio = RX / TX"
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Download vs Upload distribution ratio</p>
          </div>

          <div className="space-y-3">
            {/* Split bar */}
            <div
              className="h-4 w-full rounded-xl overflow-hidden flex border p-0.5"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div
                className="rounded-l-lg transition-all duration-300"
                style={{
                  width: `${balance.rxPercent}%`,
                  backgroundColor: 'var(--accent-rx)',
                }}
                title={`Download: ${balance.rxPercent.toFixed(1)}%`}
              />
              <div
                className="rounded-r-lg transition-all duration-300"
                style={{
                  width: `${balance.txPercent}%`,
                  backgroundColor: 'var(--accent-tx)',
                }}
                title={`Upload: ${balance.txPercent.toFixed(1)}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className="p-2.5 rounded-xl border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent-rx) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-rx) 22%, transparent)',
                }}
              >
                <div className="flex items-center gap-1 font-medium" style={{ color: 'var(--accent-rx)' }}>
                  <ArrowDown className="w-3 h-3" /> Download (RX)
                </div>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: 'var(--text-main)' }}>
                  {balance.rxPercent.toFixed(1)}%
                </div>
                <div className="text-[11px] font-mono truncate" style={{ color: 'var(--text-dim)' }}>
                  {formatBytes(total.rx, unitPreference)}
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent-tx) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-tx) 22%, transparent)',
                }}
              >
                <div className="flex items-center gap-1 font-medium" style={{ color: 'var(--accent-tx)' }}>
                  <ArrowUp className="w-3 h-3" /> Upload (TX)
                </div>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: 'var(--text-main)' }}>
                  {balance.txPercent.toFixed(1)}%
                </div>
                <div className="text-[11px] font-mono truncate" style={{ color: 'var(--text-dim)' }}>
                  {formatBytes(total.tx, unitPreference)}
                </div>
              </div>
            </div>
          </div>

          <div
            className="text-xs pt-2 border-t flex justify-between items-center"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <span>Transfer Asymmetry:</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--accent-primary)' }}>
              {balance.ratio.toFixed(2)}:1 (RX:TX)
            </span>
          </div>
        </GlassCard>
      </div>

      {/* 24-Hour Visual Activity Timeline */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Past 24 Hours Activity</h3>
              <HelpTooltip
                title="24-Hour Timeline"
                content="Hourly breakdown of network throughput for the last 24 hours. Hover any column to see exact RX, TX, and percentage of daily traffic."
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hourly throughput distribution across the day</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5" style={{ color: 'var(--accent-rx)' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--accent-rx)' }} /> RX (Download)
            </span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--accent-tx)' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--accent-tx)' }} /> TX (Upload)
            </span>
          </div>
        </div>

        {/* 24-Hour Bar Chart with Side Estimate & Scrollable Overflow */}
        {(() => {
          const last24 = hours.slice(-24);
          const max24 = Math.max(...last24.map((h: IntervalEntry) => Math.max(h.rx, h.tx)), 1024);

          return (
            <div className="flex gap-3 h-40 w-full">
              {/* Y-Axis Estimate Benchmark Column */}
              <div className="flex flex-col shrink-0">
                <div
                  className="w-16 md:w-20 flex-1 flex flex-col justify-between items-end font-mono text-[10px] select-none py-0.5"
                  style={{ color: 'var(--text-dim)' }}
                >
                  <span>{formatBytes(max24, unitPreference)}</span>
                  <span>{formatBytes(max24 * 0.75, unitPreference)}</span>
                  <span>{formatBytes(max24 * 0.5, unitPreference)}</span>
                  <span>{formatBytes(max24 * 0.25, unitPreference)}</span>
                  <span>0 B</span>
                </div>
                <div className="h-5" />
              </div>

              {/* Scrollable Bars Canvas */}
              <div className="relative flex-1 h-full min-w-0 overflow-x-auto pb-1">
                <div className="min-w-[540px] h-full flex flex-col">
                  <div className="relative flex-1 w-full">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
                      <div className="w-full border-b" style={{ borderColor: 'var(--border-subtle)' }} />
                      <div className="w-full border-b border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
                      <div className="w-full border-b border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
                      <div className="w-full border-b border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
                      <div className="w-full border-b" style={{ borderColor: 'var(--border-subtle)' }} />
                    </div>

                    {/* Side-by-side bars */}
                    <div className="h-full flex items-end gap-1.5 relative z-10 px-1">
                      {last24.map((h: IntervalEntry, idx: number) => {
                        const hTotal = h.rx + h.tx;
                        const rxPercent = max24 > 0 ? (h.rx / max24) * 100 : 0;
                        const txPercent = max24 > 0 ? (h.tx / max24) * 100 : 0;

                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col justify-end items-center h-full group relative min-w-[16px]"
                          >
                            {/* Tooltip on hover */}
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 p-2 rounded-xl border text-[10px] shadow-2xl backdrop-blur-xl z-30 whitespace-nowrap"
                              style={{
                                backgroundColor: 'var(--bg-surface)',
                                borderColor: 'var(--border-card)',
                              }}
                            >
                              <div className="font-semibold font-mono" style={{ color: 'var(--text-main)' }}>
                                {h.time ? `${String(h.time.hour).padStart(2, '0')}:00` : 'Hour'}
                              </div>
                              <div style={{ color: 'var(--accent-rx)' }}>RX: {formatBytes(h.rx, unitPreference)}</div>
                              <div style={{ color: 'var(--accent-tx)' }}>TX: {formatBytes(h.tx, unitPreference)}</div>
                              <div
                                className="font-bold border-t mt-0.5 pt-0.5"
                                style={{
                                  borderColor: 'var(--border-subtle)',
                                  color: 'var(--text-main)',
                                }}
                              >
                                Total: {formatBytes(hTotal, unitPreference)}
                              </div>
                            </div>

                            {/* RX & TX side-by-side pillars */}
                            <div className="w-full h-full flex items-end justify-center gap-0.5 sm:gap-1">
                              <div
                                className="w-1.5 sm:w-2 rounded-t transition-all group-hover:brightness-125"
                                style={{
                                  height: `${h.rx > 0 ? Math.max(4, rxPercent) : 0}%`,
                                  backgroundColor: 'var(--accent-rx)',
                                }}
                              />
                              <div
                                className="w-1.5 sm:w-2 rounded-t transition-all group-hover:brightness-125"
                                style={{
                                  height: `${h.tx > 0 ? Math.max(4, txPercent) : 0}%`,
                                  backgroundColor: 'var(--accent-tx)',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis hour labels */}
                  <div className="h-5 flex items-center gap-1.5 px-1 pt-1">
                    {last24.map((h: IntervalEntry, idx: number) => (
                      <div key={idx} className="flex-1 min-w-[16px] text-center">
                        <span className="text-[9px] font-mono select-none block truncate" style={{ color: 'var(--text-dim)' }}>
                          {h.time ? h.time.hour : idx}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex justify-between text-[11px] pt-1 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          <span>24 Hours Ago</span>
          <span>Last Updated: {iface?.updated ? formatDateTime(iface.updated.date, iface.updated.time) : '-'}</span>
          <span>Now</span>
        </div>
      </GlassCard>
    </div>
  );
};
