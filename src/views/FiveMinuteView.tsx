import React, { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { Pagination } from '../components/ui/Pagination';
import { formatBytes, formatDate, formatTime, formatRate } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';

export const FiveMinuteView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const slots: IntervalEntry[] = iface?.traffic.fiveminute || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const last36Slots = useMemo(() => slots.slice(-36), [slots]);
  const maxSlotTraffic = Math.max(
    ...last36Slots.map((s: IntervalEntry) => Math.max(s.rx, s.tx)),
    1024
  );
  const maxSlot = Math.max(...slots.map((s: IntervalEntry) => s.rx + s.tx), 1);
  const totalInPeriod = slots.reduce((acc: number, s: IntervalEntry) => acc + s.rx + s.tx, 0);

  const reversedSlots = useMemo(() => [...slots].reverse(), [slots]);
  const paginatedSlots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reversedSlots.slice(start, start + pageSize);
  }, [reversedSlots, currentPage, pageSize]);

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
              content="Side-by-side bars represent individual 300-second slots. Emerald bar indicates download (RX); purple bar indicates upload (TX)."
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-rx)' }}>
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent-rx)' }} /> RX (Download)
            </span>
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-tx)' }}>
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent-tx)' }} /> TX (Upload)
            </span>
          </div>
        </div>

        {/* Side-by-Side Bar Chart with Left Estimate & Scrollable Overflow */}
        <div className="flex gap-3 h-44 w-full">
          {/* Y-Axis Estimate Benchmark Column */}
          <div className="flex flex-col shrink-0">
            <div
              className="w-16 md:w-20 flex-1 flex flex-col justify-between items-end font-mono text-[10px] select-none py-0.5"
              style={{ color: 'var(--text-dim)' }}
            >
              <span>{formatBytes(maxSlotTraffic, unitPreference)}</span>
              <span>{formatBytes(maxSlotTraffic * 0.75, unitPreference)}</span>
              <span>{formatBytes(maxSlotTraffic * 0.5, unitPreference)}</span>
              <span>{formatBytes(maxSlotTraffic * 0.25, unitPreference)}</span>
              <span>0 B</span>
            </div>
            <div className="h-5" />
          </div>

          {/* Scrollable Bars Canvas */}
          <div className="relative flex-1 h-full min-w-0 overflow-x-auto pb-1">
            <div className="min-w-[620px] h-full flex flex-col">
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
                <div className="h-full flex items-end gap-1 relative z-10 px-1">
                  {last36Slots.map((slot: IntervalEntry, idx: number) => {
                    const slotTotal = slot.rx + slot.tx;
                    const rxPercent = maxSlotTraffic > 0 ? (slot.rx / maxSlotTraffic) * 100 : 0;
                    const txPercent = maxSlotTraffic > 0 ? (slot.tx / maxSlotTraffic) * 100 : 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 h-full flex flex-col justify-end items-center group relative min-w-[14px]"
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

                        {/* RX & TX side-by-side pillars */}
                        <div className="w-full h-full flex items-end justify-center gap-0.5">
                          <div
                            className="w-1.5 rounded-t transition-all group-hover:brightness-125"
                            style={{
                              height: `${slot.rx > 0 ? Math.max(4, rxPercent) : 0}%`,
                              backgroundColor: 'var(--accent-rx)',
                            }}
                          />
                          <div
                            className="w-1.5 rounded-t transition-all group-hover:brightness-125"
                            style={{
                              height: `${slot.tx > 0 ? Math.max(4, txPercent) : 0}%`,
                              backgroundColor: 'var(--accent-tx)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis time labels */}
              <div className="h-5 flex items-center gap-1 px-1 pt-1">
                {last36Slots.map((slot: IntervalEntry, idx: number) => (
                  <div key={idx} className="flex-1 min-w-[14px] text-center">
                    <span className="text-[8px] font-mono select-none block truncate" style={{ color: 'var(--text-dim)' }}>
                      {slot.time ? `${String(slot.time.hour).padStart(2, '0')}:${String(slot.time.minute).padStart(2, '0')}` : idx}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-white/5">
          <span>Older 5-Min Intervals</span>
          <span>Showing Recent 36 Slots (3 Hours)</span>
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
              {paginatedSlots.map((slot: IntervalEntry, idx: number) => {
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

        <Pagination
          currentPage={currentPage}
          totalItems={slots.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[20, 50, 100]}
        />
      </GlassCard>
    </div>
  );
};
