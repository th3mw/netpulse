import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { formatBytes } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';


const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MonthlyView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const months: IntervalEntry[] = iface?.traffic.month || [];

  const maxMonth = Math.max(...months.map((m: IntervalEntry) => m.rx + m.tx), 1);
  const totalMonthsTraffic = months.reduce((acc: number, m: IntervalEntry) => acc + m.rx + m.tx, 0);

  return (
    <div className="space-y-6">
      {/* Month Visual Comparison Card */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Monthly Bandwidth Trends</h3>
              <HelpTooltip
                title="Month-over-Month Telemetry"
                content="Historical monthly traffic summaries. MoM Change measures percentage delta relative to immediately preceding calendar month."
                formula="MoM Delta % = ((Current Month - Previous Month) / Previous Month) * 100"
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Month-over-month cumulative transfer records</p>
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

        <div className="h-48 flex items-end gap-3 pt-6">
          {months.map((m: IntervalEntry, idx: number) => {
            const mTotal = m.rx + m.tx;
            const heightPercent = Math.max(12, (mTotal / maxMonth) * 100);
            const rxRatio = mTotal > 0 ? m.rx / mTotal : 0.5;
            const monthLabel = m.date.month ? monthNames[m.date.month - 1] : '-';

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
                    {m.date.year} {monthLabel}
                  </div>
                  <div style={{ color: 'var(--accent-rx)' }}>RX: {formatBytes(m.rx, unitPreference)}</div>
                  <div style={{ color: 'var(--accent-tx)' }}>TX: {formatBytes(m.tx, unitPreference)}</div>
                  <div className="font-bold border-t mt-1 pt-1" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
                    Total: {formatBytes(mTotal, unitPreference)}
                  </div>
                </div>

                <div
                  className="w-full max-w-[64px] rounded-xl overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-125"
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

                <div className="text-center mt-2 font-mono">
                  <div className="text-xs font-semibold text-slate-200">{monthLabel}</div>
                  <div className="text-[10px] text-slate-400">{m.date.year}</div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Monthly Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Monthly Log Records
          </h4>
          <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            Cumulative Total: {formatBytes(totalMonthsTraffic, unitPreference)}
          </span>
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
                <th className="px-5 py-3">Month</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3">Estimated Daily Avg</th>
                <th className="px-5 py-3 text-right">MoM Change</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              {[...months].reverse().map((m: IntervalEntry, idx: number, arr: IntervalEntry[]) => {
                const mTotal = m.rx + m.tx;
                const prevMonth = arr[idx + 1];
                const prevTotal = prevMonth ? prevMonth.rx + prevMonth.tx : 0;
                const momDelta =
                  prevTotal > 0 ? ((mTotal - prevTotal) / prevTotal) * 100 : undefined;
                const monthLabel = m.date.month ? monthNames[m.date.month - 1] : '-';
                const estDaily = mTotal / 30;

                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-main)' }}>
                      {m.date.year} {monthLabel}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-rx)' }}>
                      {formatBytes(m.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-tx)' }}>
                      {formatBytes(m.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-main)' }}>
                      {formatBytes(mTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>
                      ~{formatBytes(estDaily, unitPreference)}/day
                    </td>
                    <td className="px-5 py-3 text-right">
                      {momDelta !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            momDelta >= 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {momDelta >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {momDelta >= 0 ? '+' : ''}
                          {momDelta.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
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
