import React, { useState, useMemo } from 'react';
import { Calendar, CalendarDays } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { Pagination } from '../components/ui/Pagination';
import { formatBytes, formatDate, formatRate } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DailyView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const days: IntervalEntry[] = iface?.traffic.day || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const last30Days = useMemo(() => days.slice(-30), [days]);
  const maxDayTraffic = Math.max(
    ...last30Days.map((d: IntervalEntry) => Math.max(d.rx, d.tx)),
    1024
  );
  const totalDaysTraffic = days.reduce((acc: number, d: IntervalEntry) => acc + d.rx + d.tx, 0);
  const avgDayTraffic = days.length > 0 ? totalDaysTraffic / days.length : 0;

  const reversedDays = useMemo(() => [...days].reverse(), [days]);
  const paginatedDays = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reversedDays.slice(start, start + pageSize);
  }, [reversedDays, currentPage, pageSize]);

  // Calculate weekday vs weekend averages
  let weekdayTotal = 0;
  let weekdayCount = 0;
  let weekendTotal = 0;
  let weekendCount = 0;

  days.forEach((d: IntervalEntry) => {
    const date = new Date(d.timestamp * 1000);
    const dayOfWeek = date.getDay();
    const sum = d.rx + d.tx;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendTotal += sum;
      weekendCount++;
    } else {
      weekdayTotal += sum;
      weekdayCount++;
    }
  });

  const avgWeekday = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
  const avgWeekend = weekendCount > 0 ? weekendTotal / weekendCount : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
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
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>Average Daily Volume</span>
              <HelpTooltip
                title="Daily Mean"
                content="Arithmetic mean of daily traffic across all recorded days in the database."
                formula="Avg = Total Recorded Bytes / Total Recorded Days"
              />
            </div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: 'var(--text-main)' }}>
              {formatBytes(avgDayTraffic, unitPreference)}/day
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
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>Weekday Avg (Mon-Fri)</span>
              <HelpTooltip
                title="Weekday Profile"
                content="Average daily transfer volume on working business days (Monday through Friday). Great for identifying remote work and business consumption."
              />
            </div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: 'var(--accent-rx)' }}>
              {formatBytes(avgWeekday, unitPreference)}/day
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
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>Weekend Avg (Sat-Sun)</span>
              <HelpTooltip
                title="Weekend Profile"
                content="Average daily transfer volume on weekend days (Saturday and Sunday). Highlights leisure streaming, gaming, and off-peak backups."
              />
            </div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: 'var(--accent-tx)' }}>
              {formatBytes(avgWeekend, unitPreference)}/day
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Visual Daily Column Chart */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Daily History Profile</h3>
            <HelpTooltip
              title="Daily Volume Bars"
              content="Bars display each recorded calendar day. Side-by-side bars show download (RX) vs upload (TX) volume."
            />
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

        {/* Side-by-Side Bar Chart with Left Estimate & Scrollable Overflow */}
        <div className="flex gap-3 h-48 w-full">
          {/* Y-Axis Estimate Benchmark Column */}
          <div className="flex flex-col shrink-0">
            <div
              className="w-16 md:w-20 flex-1 flex flex-col justify-between items-end font-mono text-[10px] select-none py-0.5"
              style={{ color: 'var(--text-dim)' }}
            >
              <span>{formatBytes(maxDayTraffic, unitPreference)}</span>
              <span>{formatBytes(maxDayTraffic * 0.75, unitPreference)}</span>
              <span>{formatBytes(maxDayTraffic * 0.5, unitPreference)}</span>
              <span>{formatBytes(maxDayTraffic * 0.25, unitPreference)}</span>
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
                <div className="h-full flex items-end gap-1.5 relative z-10 px-1">
                  {last30Days.map((d: IntervalEntry, idx: number) => {
                    const dTotal = d.rx + d.tx;
                    const rxPercent = maxDayTraffic > 0 ? (d.rx / maxDayTraffic) * 100 : 0;
                    const txPercent = maxDayTraffic > 0 ? (d.tx / maxDayTraffic) * 100 : 0;
                    const dayOfWeekName = dayNames[new Date(d.timestamp * 1000).getDay()];

                    return (
                      <div
                        key={idx}
                        className="flex-1 h-full flex flex-col justify-end items-center group relative min-w-[16px]"
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
                            {formatDate(d.date)} ({dayOfWeekName})
                          </div>
                          <div style={{ color: 'var(--accent-rx)' }}>RX: {formatBytes(d.rx, unitPreference)}</div>
                          <div style={{ color: 'var(--accent-tx)' }}>TX: {formatBytes(d.tx, unitPreference)}</div>
                          <div className="font-bold border-t mt-1 pt-1" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
                            Total: {formatBytes(dTotal, unitPreference)}
                          </div>
                        </div>

                        {/* RX & TX side-by-side pillars */}
                        <div className="w-full h-full flex items-end justify-center gap-0.5 sm:gap-1">
                          <div
                            className="w-1.5 sm:w-2 rounded-t transition-all group-hover:brightness-125"
                            style={{
                              height: `${d.rx > 0 ? Math.max(4, rxPercent) : 0}%`,
                              backgroundColor: 'var(--accent-rx)',
                            }}
                          />
                          <div
                            className="w-1.5 sm:w-2 rounded-t transition-all group-hover:brightness-125"
                            style={{
                              height: `${d.tx > 0 ? Math.max(4, txPercent) : 0}%`,
                              backgroundColor: 'var(--accent-tx)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis day labels */}
              <div className="h-5 flex items-center gap-1.5 px-1 pt-1">
                {last30Days.map((d: IntervalEntry, idx: number) => (
                  <div key={idx} className="flex-1 min-w-[16px] text-center">
                    <span className="text-[9px] font-mono select-none block truncate" style={{ color: 'var(--text-dim)' }}>
                      {d.date.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex justify-between text-[11px] font-mono pt-1 border-t"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-dim)' }}
        >
          <span>Older Recorded Days</span>
          <span>Showing Last 30 Recorded Days</span>
          <span>Today</span>
        </div>
      </GlassCard>

      {/* Daily Records Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Daily Log Table
          </h4>
          <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{days.length} Recorded Days</span>
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
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Day of Week</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3 text-right">Avg Rate (86400s)</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              {paginatedDays.map((d: IntervalEntry, idx: number) => {
                const dTotal = d.rx + d.tx;
                const dayOfWeek = dayNames[new Date(d.timestamp * 1000).getDay()];
                const isWeekend = dayOfWeek === 'Sun' || dayOfWeek === 'Sat';
                const avgRate = dTotal / 86400;
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(d.date)}</td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: isWeekend ? 'color-mix(in srgb, var(--accent-tx) 12%, transparent)' : 'var(--bg-input)',
                          color: isWeekend ? 'var(--accent-tx)' : 'var(--text-muted)',
                          borderColor: isWeekend ? 'color-mix(in srgb, var(--accent-tx) 25%, transparent)' : undefined,
                        }}
                      >
                        {dayOfWeek}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-rx)' }}>
                      {formatBytes(d.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-tx)' }}>
                      {formatBytes(d.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-main)' }}>
                      {formatBytes(dTotal, unitPreference)}
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
          totalItems={days.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[15, 30, 60]}
        />
      </GlassCard>
    </div>
  );
};
