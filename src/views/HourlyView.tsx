import React from 'react';
import { BarChart3, Clock, Zap } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { formatBytes, formatDate, formatRate } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';


export const HourlyView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference, percentileReport } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const hours: IntervalEntry[] = iface?.traffic.hour || [];

  const maxHour = Math.max(...hours.map((h: IntervalEntry) => h.rx + h.tx), 1);
  const total24h = hours.reduce((acc: number, h: IntervalEntry) => acc + h.rx + h.tx, 0);

  const peakHour = hours.reduce(
    (max: IntervalEntry, h: IntervalEntry) => (h.rx + h.tx > max.rx + max.tx ? h : max),
    hours[0] || ({ rx: 0, tx: 0 } as IntervalEntry)
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)',
              color: 'var(--accent-primary)',
            }}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>24h Total Traffic</span>
              <HelpTooltip
                title="Rolling 24-Hour Sum"
                content="Aggregated data transferred over the last 24 one-hour measurement blocks recorded by the vnstat daemon."
                formula="Sum = Σ(hour.rx + hour.tx) for last 24h"
              />
            </div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: 'var(--text-main)' }}>
              {formatBytes(total24h, unitPreference)}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-rx) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-rx) 25%, transparent)',
              color: 'var(--accent-rx)',
            }}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>Peak Hour Spike</span>
              <HelpTooltip
                title="Peak Hour Volume"
                content="The single 60-minute window with the largest total data volume within the active 24-hour cycle."
              />
            </div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: 'var(--accent-rx)' }}>
              {peakHour?.time ? `${peakHour.time.hour}:00` : '-'} (
              {formatBytes((peakHour?.rx || 0) + (peakHour?.tx || 0), unitPreference)})
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-tx) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-tx) 25%, transparent)',
              color: 'var(--accent-tx)',
            }}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>95th % Rate Ceiling</span>
              <HelpTooltip
                title="95th Percentile Rate"
                content="Calculated by sorting all 5-minute/hourly samples and discarding top 5% extreme bursts. Industry-standard ISP transit billing method."
                formula="Sort samples ascending, pick sample at rank N * 0.95"
              />
            </div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: 'var(--accent-tx)' }}>
              {percentileReport?.total_95th_str || '-'}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Hourly Bar Chart */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Hourly Bandwidth Profile (Past 24 Hours)</h3>
            <HelpTooltip
              title="24-Hour Hourly Timeline"
              content="Bars display each elapsed hour of the day. Emerald is incoming download; purple is outgoing upload. Amber outline flags the peak hour."
            />
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

        <div className="h-44 flex items-end gap-2 pt-4">
          {hours.slice(-24).map((h: IntervalEntry, idx: number) => {
            const hTotal = h.rx + h.tx;
            const heightPercent = Math.max(8, (hTotal / maxHour) * 100);
            const rxRatio = hTotal > 0 ? h.rx / hTotal : 0.5;
            const isPeak = h === peakHour && hTotal > 0;

            return (
              <div
                key={idx}
                className="flex-1 h-full flex flex-col justify-end items-center group relative"
              >
                {/* Tooltip */}
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 p-2.5 rounded-xl border text-[11px] font-mono shadow-2xl backdrop-blur-xl z-30 whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-main)',
                  }}
                >
                  <div className="font-semibold" style={{ color: 'var(--text-main)' }}>
                    {formatDate(h.date)} {h.time ? `${String(h.time.hour).padStart(2, '0')}:00` : ''}
                    {isPeak && <span className="ml-1.5 font-bold" style={{ color: 'var(--accent-primary)' }}>[PEAK]</span>}
                  </div>
                  <div style={{ color: 'var(--accent-rx)' }}>RX: {formatBytes(h.rx, unitPreference)}</div>
                  <div style={{ color: 'var(--accent-tx)' }}>TX: {formatBytes(h.tx, unitPreference)}</div>
                  <div className="font-bold border-t mt-1 pt-1" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
                    Total: {formatBytes(hTotal, unitPreference)} ({total24h > 0 ? ((hTotal / total24h) * 100).toFixed(1) : 0}%)
                  </div>
                </div>

                <div
                  className={`w-full rounded-md overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-125 ${
                    isPeak ? 'ring-2 ring-amber-400/80 shadow-lg shadow-amber-400/20' : ''
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="w-full"
                    style={{ height: `${(1 - rxRatio) * 100}%`, backgroundColor: 'var(--accent-tx)' }}
                  />
                  <div
                    className="w-full"
                    style={{ height: `${rxRatio * 100}%`, backgroundColor: 'var(--accent-rx)' }}
                  />
                </div>

                <span className="text-[10px] font-mono mt-1.5" style={{ color: 'var(--text-dim)' }}>
                  {h.time ? h.time.hour : idx}h
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Hourly Detail Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Hourly Log Records
          </h4>
          <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{hours.length} Recorded Hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className="font-medium border-b"
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <th className="px-5 py-3">Hour Slot</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3 text-right">Avg Rate (3600s)</th>
                <th className="px-5 py-3 text-right">% of Window</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              {[...hours].reverse().map((h: IntervalEntry, idx: number) => {
                const hTotal = h.rx + h.tx;
                const avgRate = hTotal / 3600;
                const pct = total24h > 0 ? (hTotal / total24h) * 100 : 0;
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(h.date)} {h.time ? `${String(h.time.hour).padStart(2, '0')}:00` : ''}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-rx)' }}>
                      {formatBytes(h.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-tx)' }}>
                      {formatBytes(h.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-main)' }}>
                      {formatBytes(hTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium" style={{ color: 'var(--accent-primary)' }}>
                      {formatRate(avgRate, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right" style={{ color: 'var(--text-muted)' }}>
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
