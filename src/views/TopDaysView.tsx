import React from 'react';
import { Trophy, Medal, Award, Flame, Calendar } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
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
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> #1 ALL-TIME RECORD
                </span>
                <HelpTooltip
                  title="All-Time Record Day"
                  content="The single 24-hour day with the highest total combined bandwidth (RX + TX) recorded in the database."
                  formula="max(day.rx + day.tx) across all history"
                />
              </div>
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>

            <div className="text-2xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
              {formatBytes(topDays[0].rx + topDays[0].tx, unitPreference)}
            </div>
            <div className="text-xs mt-1 flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
              {formatDate(topDays[0].date)} ({dayNames[new Date(topDays[0].timestamp * 1000).getDay()]})
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-[11px] font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <span className="opacity-60" style={{ color: 'var(--text-dim)' }}>RX:</span>{' '}
                <span style={{ color: 'var(--accent-rx)' }}>{formatBytes(topDays[0].rx, unitPreference)}</span>
              </div>
              <div>
                <span className="opacity-60" style={{ color: 'var(--text-dim)' }}>TX:</span>{' '}
                <span style={{ color: 'var(--accent-tx)' }}>{formatBytes(topDays[0].tx, unitPreference)}</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Rank 2 - Silver */}
        {topDays[1] && (
          <GlassCard className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold font-mono"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <Medal className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> #2 RANK
              </span>
            </div>

            <div className="text-2xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
              {formatBytes(topDays[1].rx + topDays[1].tx, unitPreference)}
            </div>
            <div className="text-xs mt-1 flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
              {formatDate(topDays[1].date)} ({dayNames[new Date(topDays[1].timestamp * 1000).getDay()]})
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-[11px] font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <span className="opacity-60" style={{ color: 'var(--text-dim)' }}>RX:</span>{' '}
                <span style={{ color: 'var(--accent-rx)' }}>{formatBytes(topDays[1].rx, unitPreference)}</span>
              </div>
              <div>
                <span className="opacity-60" style={{ color: 'var(--text-dim)' }}>TX:</span>{' '}
                <span style={{ color: 'var(--accent-tx)' }}>{formatBytes(topDays[1].tx, unitPreference)}</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Rank 3 - Bronze */}
        {topDays[2] && (
          <GlassCard className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold font-mono"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent-tx) 15%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-tx) 30%, transparent)',
                  color: 'var(--accent-tx)',
                }}
              >
                <Award className="w-3.5 h-3.5" style={{ color: 'var(--accent-tx)' }} /> #3 RANK
              </span>
            </div>

            <div className="text-2xl font-black font-mono" style={{ color: 'var(--text-main)' }}>
              {formatBytes(topDays[2].rx + topDays[2].tx, unitPreference)}
            </div>
            <div className="text-xs mt-1 flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
              {formatDate(topDays[2].date)} ({dayNames[new Date(topDays[2].timestamp * 1000).getDay()]})
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-[11px] font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <span className="opacity-60" style={{ color: 'var(--text-dim)' }}>RX:</span>{' '}
                <span style={{ color: 'var(--accent-rx)' }}>{formatBytes(topDays[2].rx, unitPreference)}</span>
              </div>
              <div>
                <span className="opacity-60" style={{ color: 'var(--text-dim)' }}>TX:</span>{' '}
                <span style={{ color: 'var(--accent-tx)' }}>{formatBytes(topDays[2].tx, unitPreference)}</span>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Leaderboard Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
              All-Time Top Days Leaderboard
            </h4>
            <HelpTooltip
              title="Top Days Table"
              content="Lists up to 25 peak record traffic days sorted in descending order of total throughput. Progress bars indicate relative percentage compared to record day #1."
            />
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Top {topDays.length} Records</span>
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
                <th className="px-5 py-3 w-16">Rank</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Day of Week</th>
                <th className="px-5 py-3">Download (RX)</th>
                <th className="px-5 py-3">Upload (TX)</th>
                <th className="px-5 py-3">Total Volume</th>
                <th className="px-5 py-3 text-right">% of Record #1</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
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
                        <span
                          className="w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs border"
                          style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-300 font-bold flex items-center justify-center text-xs border border-orange-600/30">
                          3
                        </span>
                      ) : (
                        <span className="font-semibold px-2" style={{ color: 'var(--text-dim)' }}>#{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-main)' }}>{formatDate(d.date)}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{dayOfWeek}</td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-rx)' }}>
                      {formatBytes(d.rx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--accent-tx)' }}>
                      {formatBytes(d.tx, unitPreference)}
                    </td>
                    <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-main)' }}>
                      {formatBytes(dTotal, unitPreference)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-input)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: 'var(--accent-primary)' }}
                          />
                        </div>
                        <span className="font-semibold w-12 text-right" style={{ color: 'var(--text-muted)' }}>
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
