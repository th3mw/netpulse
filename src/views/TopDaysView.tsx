import React from 'react';
import { Trophy, Medal, Award, Flame, Calendar } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { formatBytes, formatDate } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';


const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TopDaysView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const topDays: IntervalEntry[] = iface?.traffic.top || [];

  const recordDay = topDays[0];
  const recordDayTotal = recordDay ? recordDay.rx + recordDay.tx : 1;

  return (
    <div className="space-y-6">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rank 1 - Gold */}
        {topDays[0] && (
          <GlassCard className="p-5 relative overflow-hidden border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> #1 ALL-TIME RECORD
              </span>
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>

            <div className="text-2xl font-black text-amber-300 font-mono">
              {formatBytes(topDays[0].rx + topDays[0].tx, unitPreference)}
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(topDays[0].date)} ({dayNames[new Date(topDays[0].timestamp * 1000).getDay()]})
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-amber-500/20 text-[11px] font-mono">
              <div>
                <span className="text-slate-400">RX:</span>{' '}
                <span className="text-emerald-400">{formatBytes(topDays[0].rx, unitPreference)}</span>
              </div>
              <div>
                <span className="text-slate-400">TX:</span>{' '}
                <span className="text-purple-400">{formatBytes(topDays[0].tx, unitPreference)}</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Rank 2 - Silver */}
        {topDays[1] && (
          <GlassCard className="p-5 relative overflow-hidden border-slate-300/30 bg-gradient-to-b from-slate-400/10 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/30 text-xs font-bold font-mono">
                <Medal className="w-3.5 h-3.5 text-slate-300" /> #2 RANK
              </span>
            </div>

            <div className="text-2xl font-black text-slate-100 font-mono">
              {formatBytes(topDays[1].rx + topDays[1].tx, unitPreference)}
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(topDays[1].date)} ({dayNames[new Date(topDays[1].timestamp * 1000).getDay()]})
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-[11px] font-mono">
              <div>
                <span className="text-slate-400">RX:</span>{' '}
                <span className="text-emerald-400">{formatBytes(topDays[1].rx, unitPreference)}</span>
              </div>
              <div>
                <span className="text-slate-400">TX:</span>{' '}
                <span className="text-purple-400">{formatBytes(topDays[1].tx, unitPreference)}</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Rank 3 - Bronze */}
        {topDays[2] && (
          <GlassCard className="p-5 relative overflow-hidden border-orange-600/30 bg-gradient-to-b from-orange-600/10 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-600/20 text-orange-300 border border-orange-600/30 text-xs font-bold font-mono">
                <Award className="w-3.5 h-3.5 text-orange-400" /> #3 RANK
              </span>
            </div>

            <div className="text-2xl font-black text-orange-200 font-mono">
              {formatBytes(topDays[2].rx + topDays[2].tx, unitPreference)}
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(topDays[2].date)} ({dayNames[new Date(topDays[2].timestamp * 1000).getDay()]})
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-[11px] font-mono">
              <div>
                <span className="text-slate-400">RX:</span>{' '}
                <span className="text-emerald-400">{formatBytes(topDays[2].rx, unitPreference)}</span>
              </div>
              <div>
                <span className="text-slate-400">TX:</span>{' '}
                <span className="text-purple-400">{formatBytes(topDays[2].tx, unitPreference)}</span>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Leaderboard Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            All-Time Top Days Leaderboard
          </h4>
          <span className="text-xs text-slate-400 font-mono">Top {topDays.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
                <th className="px-5 py-3 w-16">Rank</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Day of Week</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3 text-right">% of Record #1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {topDays.map((d: IntervalEntry, idx: number) => {
                const dTotal = d.rx + d.tx;
                const pct = recordDayTotal > 0 ? (dTotal / recordDayTotal) * 100 : 0;
                const dayOfWeek = dayNames[new Date(d.timestamp * 1000).getDay()];

                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      {idx === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 font-bold flex items-center justify-center text-xs border border-slate-300/30">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-300 font-bold flex items-center justify-center text-xs border border-orange-600/30">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold px-2">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-200 font-semibold">{formatDate(d.date)}</td>
                    <td className="px-5 py-3 text-slate-400">{dayOfWeek}</td>
                    <td className="px-5 py-3 text-emerald-400 font-medium">
                      {formatBytes(d.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-purple-400 font-medium">
                      {formatBytes(d.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-white font-bold">
                      {formatBytes(dTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-slate-300 font-semibold w-12 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
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
