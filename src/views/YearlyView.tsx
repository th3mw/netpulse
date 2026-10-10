import { Archive } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { formatBytes } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';


export const YearlyView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const years: IntervalEntry[] = iface?.traffic.year || [];

  const maxYearTraffic = Math.max(...years.map((y: IntervalEntry) => Math.max(y.rx, y.tx)), 1024);
  const totalYearsTraffic = years.reduce((acc: number, y: IntervalEntry) => acc + y.rx + y.tx, 0);

  return (
    <div className="space-y-6">
      {/* Yearly Summary Card */}
      <GlassCard className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)',
              color: 'var(--accent-primary)',
            }}
          >
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Annual Telemetry Records</h3>
              <HelpTooltip
                title="Yearly Database Logs"
                content="Long-term multi-year cumulative bandwidth records archived in the vnstat SQLite database. Preserved across system reboots and kernel upgrades."
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Multi-year cumulative volume tracked by vnstat</p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[10px] uppercase" style={{ color: 'var(--text-dim)' }}>Cumulative Lifetime Traffic</span>
            <HelpTooltip
              title="Lifetime Total"
              content="Sum of all data transferred across all recorded years for this network interface."
              side="left"
            />
          </div>
          <div className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>
            {formatBytes(totalYearsTraffic, unitPreference)}
          </div>
        </div>
      </GlassCard>

      {/* Yearly Comparison Chart */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Annual Volume Distribution
            </h4>
            <HelpTooltip
              title="Yearly Distribution"
              content="Side-by-side bars comparing annual volume across active recorded years. Displays download (RX) vs upload (TX) proportions."
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
              <span>{formatBytes(maxYearTraffic, unitPreference)}</span>
              <span>{formatBytes(maxYearTraffic * 0.75, unitPreference)}</span>
              <span>{formatBytes(maxYearTraffic * 0.5, unitPreference)}</span>
              <span>{formatBytes(maxYearTraffic * 0.25, unitPreference)}</span>
              <span>0 B</span>
            </div>
            <div className="h-6" />
          </div>

          {/* Scrollable Bars Canvas */}
          <div className="relative flex-1 h-full min-w-0 overflow-x-auto pb-1">
            <div className="min-w-[400px] h-full flex flex-col">
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
                <div className="h-full flex items-end gap-6 relative z-10 px-4">
                  {years.map((y: IntervalEntry, idx: number) => {
                    const yTotal = y.rx + y.tx;
                    const rxPercent = maxYearTraffic > 0 ? (y.rx / maxYearTraffic) * 100 : 0;
                    const txPercent = maxYearTraffic > 0 ? (y.tx / maxYearTraffic) * 100 : 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 max-w-[140px] h-full flex flex-col justify-end items-center group relative min-w-[48px]"
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
                          <div className="font-semibold" style={{ color: 'var(--text-main)' }}>Year {y.date.year}</div>
                          <div style={{ color: 'var(--accent-rx)' }}>RX: {formatBytes(y.rx, unitPreference)}</div>
                          <div style={{ color: 'var(--accent-tx)' }}>TX: {formatBytes(y.tx, unitPreference)}</div>
                          <div className="font-bold border-t mt-1 pt-1" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
                            Total: {formatBytes(yTotal, unitPreference)}
                          </div>
                        </div>

                        {/* RX & TX side-by-side pillars */}
                        <div className="w-full h-full flex items-end justify-center gap-1.5">
                          <div
                            className="w-4 sm:w-5 rounded-t transition-all group-hover:brightness-125"
                            style={{
                              height: `${y.rx > 0 ? Math.max(4, rxPercent) : 0}%`,
                              backgroundColor: 'var(--accent-rx)',
                            }}
                          />
                          <div
                            className="w-4 sm:w-5 rounded-t transition-all group-hover:brightness-125"
                            style={{
                              height: `${y.tx > 0 ? Math.max(4, txPercent) : 0}%`,
                              backgroundColor: 'var(--accent-tx)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis year labels */}
              <div className="h-6 flex items-center gap-6 px-4 pt-1">
                {years.map((y: IntervalEntry, idx: number) => (
                  <div key={idx} className="flex-1 max-w-[140px] min-w-[48px] text-center font-mono">
                    <span className="text-xs font-bold truncate block" style={{ color: 'var(--text-main)' }}>
                      {y.date.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Yearly Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Yearly Table Logs
          </h4>
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
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3 text-right">Estimated Monthly Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              {[...years].reverse().map((y: IntervalEntry, idx: number) => {
                const yTotal = y.rx + y.tx;
                const estMonthly = yTotal / 12;
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-bold text-sm" style={{ color: 'var(--text-main)' }}>{y.date.year}</td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-rx)' }}>
                      {formatBytes(y.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-tx)' }}>
                      {formatBytes(y.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-main)' }}>
                      {formatBytes(yTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium" style={{ color: 'var(--accent-primary)' }}>
                      ~{formatBytes(estMonthly, unitPreference)}/mo
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
