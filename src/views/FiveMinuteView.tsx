import React from 'react';
import { Clock } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { formatBytes, formatDate, formatTime, formatRate } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';


export const FiveMinuteView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const slots: IntervalEntry[] = iface?.traffic.fiveminute || [];

  const maxSlot = Math.max(...slots.map((s: IntervalEntry) => s.rx + s.tx), 1);
  const totalInPeriod = slots.reduce((acc: number, s: IntervalEntry) => acc + s.rx + s.tx, 0);

  return (
    <div className="space-y-6">
      {/* Summary Header Card */}
      <GlassCard className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)',
              color: 'var(--accent-primary)',
            }}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>5-Minute Granular Telemetry</h3>
              <HelpTooltip
                title="5-Minute Sampling Interval"
                content="vnstat captures high-resolution 300-second traffic blocks. Essential for catching short-lived bandwidth spikes, game downloads, or buffer-bloat events that hourly averages smooth out."
                formula="Slot Duration = 300 seconds (5 min)"
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              High-resolution 300-second sample slots from vnstat database ({slots.length} slots available)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div
            className="p-2.5 rounded-xl border text-right"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] uppercase" style={{ color: 'var(--text-dim)' }}>Recent Window Total</span>
              <HelpTooltip
                title="Window Total"
                content="Sum of received and sent bytes across all currently logged 5-minute slots in the SQLite database."
                side="left"
              />
            </div>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>
              {formatBytes(totalInPeriod, unitPreference)}
            </div>
          </div>
          <div
            className="p-2.5 rounded-xl border text-right"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] uppercase" style={{ color: 'var(--text-dim)' }}>Highest Slot Burst</span>
              <HelpTooltip
                title="Peak 5-Min Burst"
                content="The single 5-minute slot with maximum aggregate transfer volume during the sampled period."
                side="left"
              />
            </div>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent-primary)' }}>
              {formatBytes(maxSlot, unitPreference)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Visual Step Timeline */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Micro-Burst Activity Curve (5-Min Slots)
            </h4>
            <HelpTooltip
              title="Slot Stack Composition"
              content="Vertical bars represent individual 300-second slots. Emerald segment indicates download (RX); purple segment indicates upload (TX)."
            />
          </div>
        </div>

        <div className="h-28 flex items-end gap-1 pt-2">
          {slots.slice(-36).map((slot: IntervalEntry, idx: number) => {
            const slotTotal = slot.rx + slot.tx;
            const heightPercent = Math.max(6, (slotTotal / maxSlot) * 100);
            const rxRatio = slotTotal > 0 ? slot.rx / slotTotal : 0.5;

            return (
              <div
                key={idx}
                className="flex-1 h-full flex flex-col justify-end items-center group relative"
              >
                {/* Tooltip */}
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 p-2 rounded-xl border text-[10px] font-mono shadow-2xl backdrop-blur-xl z-30 whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-main)',
                  }}
                >
                  <div className="font-semibold" style={{ color: 'var(--text-main)' }}>
                    {formatDate(slot.date)} {formatTime(slot.time)}
                  </div>
                  <div style={{ color: 'var(--accent-rx)' }}>RX: {formatBytes(slot.rx, unitPreference)}</div>
                  <div style={{ color: 'var(--accent-tx)' }}>TX: {formatBytes(slot.tx, unitPreference)}</div>
                  <div className="border-t mt-0.5 pt-0.5 font-bold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Avg Rate: {formatRate(slotTotal / 300, unitPreference)}
                  </div>
                </div>

                <div
                  className="w-full rounded-sm overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-125"
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
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-white/5">
          <span>Older 5-Min Intervals</span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-rx)' }}>
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent-rx)' }} /> RX
            </span>
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-tx)' }}>
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent-tx)' }} /> TX
            </span>
          </span>
          <span>Latest Slot</span>
        </div>
      </GlassCard>

      {/* Granular Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Slot Log Entries
          </h4>
          <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Showing {slots.length} entries</span>
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
                <th className="px-5 py-3">Timestamp / Time</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Slot Total</th>
                <th className="px-5 py-3 text-right">Avg Rate (300s)</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              {[...slots].reverse().map((slot: IntervalEntry, idx: number) => {
                const slotTotal = slot.rx + slot.tx;
                const avgRate = slotTotal / 300;
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3" style={{ color: 'var(--text-main)' }}>
                      {formatDate(slot.date)}{' '}
                      <span style={{ color: 'var(--text-dim)' }}>{formatTime(slot.time)}</span>
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-rx)' }}>
                      {formatBytes(slot.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-tx)' }}>
                      {formatBytes(slot.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-main)' }}>
                      {formatBytes(slotTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium" style={{ color: 'var(--accent-primary)' }}>
                      {formatRate(avgRate, unitPreference)}
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
