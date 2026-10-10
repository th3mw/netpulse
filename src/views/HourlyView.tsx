import React from 'react';
import { BarChart3, Clock, Zap, ArrowDown, ArrowUp } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { GlassCard } from '../ui/GlassCard';
import { formatBytes, formatDate, formatRate } from '../../lib/formatters';

export const HourlyView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference, percentileReport } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const hours = iface?.traffic.hour || [];

  const maxHour = Math.max(...hours.map((h) => h.rx + h.tx), 1);
  const total24h = hours.reduce((acc, h) => acc + h.rx + h.tx, 0);

  const peakHour = hours.reduce(
    (max, h) => (h.rx + h.tx > max.rx + max.tx ? h : max),
    hours[0] || { rx: 0, tx: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">24h Total Traffic</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {formatBytes(total24h, unitPreference)}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Peak Hour Spike</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
              {peakHour?.time ? `${peakHour.time.hour}:00` : '-'} (
              {formatBytes((peakHour?.rx || 0) + (peakHour?.tx || 0), unitPreference)})
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">95th % Rate Ceiling</span>
            <div className="text-xl font-bold text-purple-300 font-mono mt-0.5">
              {percentileReport?.total_95th_str || '-'}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Hourly Bar Chart */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Hourly Bandwidth Profile (Past 24 Hours)</h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> RX
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> TX
            </span>
          </div>
        </div>

        <div className="h-44 flex items-end gap-2 pt-4">
          {hours.slice(-24).map((h, idx) => {
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
                <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 p-2.5 rounded-xl bg-slate-900 border border-white/15 text-[11px] font-mono shadow-2xl backdrop-blur-xl z-30 whitespace-nowrap">
                  <div className="font-semibold text-white">
                    {formatDate(h.date)} {h.time ? `${String(h.time.hour).padStart(2, '0')}:00` : ''}
                    {isPeak && <span className="text-amber-400 ml-1.5 font-bold">[PEAK]</span>}
                  </div>
                  <div className="text-emerald-400">RX: {formatBytes(h.rx, unitPreference)}</div>
                  <div className="text-purple-400">TX: {formatBytes(h.tx, unitPreference)}</div>
                  <div className="text-slate-100 font-bold border-t border-white/10 mt-1 pt-1">
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
                    className="w-full bg-purple-500/85"
                    style={{ height: `${(1 - rxRatio) * 100}%` }}
                  />
                  <div className="w-full bg-emerald-500" style={{ height: `${rxRatio * 100}%` }} />
                </div>

                <span className="text-[10px] text-slate-400 font-mono mt-1.5">
                  {h.time ? h.time.hour : idx}h
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Hourly Detail Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Hourly Log Records
          </h4>
          <span className="text-xs text-slate-400 font-mono">{hours.length} Recorded Hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
                <th className="px-5 py-3">Hour Slot</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3 text-right">Avg Rate (3600s)</th>
                <th className="px-5 py-3 text-right">% of Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {[...hours].reverse().map((h, idx) => {
                const hTotal = h.rx + h.tx;
                const avgRate = hTotal / 3600;
                const pct = total24h > 0 ? (hTotal / total24h) * 100 : 0;
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-slate-300">
                      {formatDate(h.date)} {h.time ? `${String(h.time.hour).padStart(2, '0')}:00` : ''}
                    </td>
                    <td className="px-5 py-3 text-emerald-400 font-medium">
                      {formatBytes(h.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-purple-400 font-medium">
                      {formatBytes(h.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-white font-semibold">
                      {formatBytes(hTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right text-cyan-400">
                      {formatRate(avgRate, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400">
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
