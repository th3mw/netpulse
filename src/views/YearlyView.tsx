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

  const maxYear = Math.max(...years.map((y: IntervalEntry) => y.rx + y.tx), 1);
  const totalYearsTraffic = years.reduce((acc: number, y: IntervalEntry) => acc + y.rx + y.tx, 0);

  return (
    <div className="space-y-6">
      {/* Yearly Summary Card */}
      <GlassCard className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Annual Telemetry Records</h3>
              <HelpTooltip
                title="Yearly Database Logs"
                content="Long-term multi-year cumulative bandwidth records archived in the vnstat SQLite database. Preserved across system reboots and kernel upgrades."
              />
            </div>
            <p className="text-xs text-slate-400">Multi-year cumulative volume tracked by vnstat</p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase">Cumulative Lifetime Traffic</span>
            <HelpTooltip
              title="Lifetime Total"
              content="Sum of all data transferred across all recorded years for this network interface."
              side="left"
            />
          </div>
          <div className="text-xl font-bold text-white mt-0.5">
            {formatBytes(totalYearsTraffic, unitPreference)}
          </div>
        </div>
      </GlassCard>

      {/* Yearly Comparison Chart */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Annual Volume Distribution
          </h4>
          <HelpTooltip
            title="Yearly Distribution"
            content="Visual column bars comparing annual volume across active recorded years. Displays download vs upload proportions."
          />
        </div>

        <div className="h-44 flex items-end gap-6 pt-4">
          {years.map((y: IntervalEntry, idx: number) => {
            const yTotal = y.rx + y.tx;
            const heightPercent = Math.max(15, (yTotal / maxYear) * 100);
            const rxRatio = yTotal > 0 ? y.rx / yTotal : 0.5;

            return (
              <div
                key={idx}
                className="flex-1 max-w-[120px] h-full flex flex-col justify-end items-center group relative"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 p-2.5 rounded-xl bg-slate-900 border border-white/15 text-[11px] font-mono shadow-2xl backdrop-blur-xl z-30 whitespace-nowrap">
                  <div className="font-semibold text-white">Year {y.date.year}</div>
                  <div className="text-emerald-400">RX: {formatBytes(y.rx, unitPreference)}</div>
                  <div className="text-purple-400">TX: {formatBytes(y.tx, unitPreference)}</div>
                  <div className="text-slate-100 font-bold border-t border-white/10 mt-1 pt-1">
                    Total: {formatBytes(yTotal, unitPreference)}
                  </div>
                </div>

                <div
                  className="w-full rounded-2xl overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-125"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="w-full bg-purple-500/85"
                    style={{ height: `${(1 - rxRatio) * 100}%` }}
                  />
                  <div className="w-full bg-emerald-500" style={{ height: `${rxRatio * 100}%` }} />
                </div>

                <span className="text-sm font-bold text-slate-200 font-mono mt-2">
                  {y.date.year}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Yearly Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Yearly Table Logs
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3 text-right">Estimated Monthly Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {[...years].reverse().map((y: IntervalEntry, idx: number) => {
                const yTotal = y.rx + y.tx;
                const estMonthly = yTotal / 12;
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-slate-200 font-bold text-sm">{y.date.year}</td>
                    <td className="px-5 py-3 text-emerald-400 font-medium">
                      {formatBytes(y.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-purple-400 font-medium">
                      {formatBytes(y.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-white font-bold">
                      {formatBytes(yTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right text-cyan-400">
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
