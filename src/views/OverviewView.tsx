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
          icon={<Activity className="w-4 h-4 text-purple-400" />}
          accentColor="purple"
          badge="Forecast"
          helpTitle="Month Run-Rate Forecast"
          helpContent="Estimated total volume by the end of the billing cycle based on your current daily consumption rate."
          helpFormula="used_bytes + (daily_burn * days_remaining)"
        />

        <MetricCard
          title="95th Percentile Burst"
          value={percentileReport?.total_95th_str || 'Calculating...'}
          subValue={`RX: ${percentileReport?.rx_95th_str || '-'} • TX: ${percentileReport?.tx_95th_str || '-'}`}
          icon={<Gauge className="w-4 h-4 text-amber-400" />}
          accentColor="amber"
          badge="ISP Billing"
          helpTitle="95th Percentile Bandwidth"
          helpContent="Burstable billing rate used by transit providers: top 5% peak spikes are discarded, leaving the 95th percentile sustained rate."
          helpFormula="Ranked_Samples[ceil(0.95 * N)]"
        />

        <MetricCard
          title="All-Time Total"
          value={formatBytes(total.rx + total.tx, unitPreference)}
          subValue={`RX: ${formatBytes(total.rx, unitPreference)} • TX: ${formatBytes(total.tx, unitPreference)}`}
          icon={<HardDrive className="w-4 h-4 text-emerald-400" />}
          accentColor="emerald"
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
                  <h3 className="text-sm font-semibold text-white">Monthly Quota & Burn Rate</h3>
                  <HelpTooltip
                    title="Quota & Burn Rate"
                    content="Tracks your data cap usage against your billing renewal day. Warns before overage charges and suggests maximum daily burn allowance."
                    formula="(monthly_used / quota_cap) * 100%"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Cycle day {projection.daysElapsed} of {projection.daysTotal} (Resets on day{' '}
                  {billingConfig.cycleStartDay})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{projection.daysTotal - projection.daysElapsed} days remaining</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">
                Used:{' '}
                <strong className="text-white font-mono">
                  {formatBytes(currentMonthTotal, unitPreference)}
                </strong>
              </span>
              <span className="text-slate-400">
                Limit:{' '}
                <strong className="text-white font-mono">
                  {formatBytes(billingConfig.monthlyQuotaBytes, unitPreference)}
                </strong>
              </span>
            </div>

            <div className="h-3 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (projection.quotaPercent || 0) > 90
                    ? 'bg-rose-500'
                    : (projection.quotaPercent || 0) > 75
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(100, projection.quotaPercent || 0)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                {(projection.quotaPercent || 0) > 85 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  Quota used: <strong>{(projection.quotaPercent || 0).toFixed(1)}%</strong>
                </span>
              </div>
              <div className="text-slate-400">
                Daily Budget Remaining:{' '}
                <strong className="text-cyan-400 font-mono">
                  {formatBytes(projection.recommendedDailyAllowance || 0, unitPreference)}/day
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Daily Burn Rate</span>
              <div className="text-sm font-semibold text-white font-mono mt-0.5">
                {formatBytes(projection.burnRatePerDay, unitPreference)}/day
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Busiest Hour</span>
              <div className="text-sm font-semibold text-white font-mono mt-0.5">
                {peakHour?.time ? `${peakHour.time.hour}:00` : '-'} (
                {formatBytes((peakHour?.rx || 0) + (peakHour?.tx || 0), unitPreference)})
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-medium">All-Time Peak Day</span>
              <div className="text-sm font-semibold text-white font-mono mt-0.5 truncate">
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
              <h3 className="text-sm font-semibold text-white">Traffic Symmetry</h3>
              <HelpTooltip
                title="Traffic Symmetry (RX vs TX)"
                content="Compares inbound download volume (RX) to outbound upload volume (TX). Most home connections are heavily download-skewed (3:1 to 10:1)."
                formula="Ratio = RX / TX"
              />
            </div>
            <p className="text-xs text-slate-400">Download vs Upload distribution ratio</p>
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
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.2)',
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
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  borderColor: 'rgba(168, 85, 247, 0.2)',
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
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--accent-rx)' }} /> RX
            </span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--accent-tx)' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--accent-tx)' }} /> TX
            </span>
          </div>
        </div>

        {/* 24-Hour Bar Chart */}
        <div className="h-36 flex items-end gap-1.5 pt-4">
          {hours.slice(-24).map((h: IntervalEntry, idx: number) => {
            const hTotal = h.rx + h.tx;
            const maxVal = Math.max(
              ...hours.slice(-24).map((x: IntervalEntry) => x.rx + x.tx),
              1
            );
            const heightPercent = Math.max(6, (hTotal / maxVal) * 100);
            const rxRatio = hTotal > 0 ? h.rx / hTotal : 0.5;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end items-center h-full group relative"
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

                <div
                  className="w-full rounded-md overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-125"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="w-full"
                    style={{
                      height: `${(1 - rxRatio) * 100}%`,
                      backgroundColor: 'var(--accent-tx)',
                    }}
                  />
                  <div
                    className="w-full"
                    style={{
                      height: `${rxRatio * 100}%`,
                      backgroundColor: 'var(--accent-rx)',
                    }}
                  />
                </div>

                <span className="text-[9px] font-mono mt-1" style={{ color: 'var(--text-dim)' }}>
                  {h.time ? h.time.hour : idx}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
          <span>24 Hours Ago</span>
          <span>Last Updated: {iface?.updated ? formatDateTime(iface.updated.date, iface.updated.time) : '-'}</span>
          <span>Now</span>
        </div>
      </GlassCard>
    </div>
  );
};
