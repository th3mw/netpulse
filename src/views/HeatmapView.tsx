import React from 'react';
import { Grid, Flame } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { calculateActivityHeatmap } from '../lib/calculations';
import { formatBytes } from '../lib/formatters';
import type { IntervalEntry } from '../types/vnstat';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HeatmapView: React.FC = () => {
  const { selectedInterface, vnstatData, unitPreference } = useNetworkStore();
  const iface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const hourly: IntervalEntry[] = iface?.traffic.hour || [];

  const { matrix, maxBytes, dayTotals, hourTotals } = React.useMemo(
    () => calculateActivityHeatmap(hourly),
    [hourly]
  );

  const [hoveredCell, setHoveredCell] = React.useState<{
    day: number;
    hour: number;
    intensity: number;
  } | null>(null);

  const getCellColor = (intensity: number) => {
    if (intensity === 0) return 'bg-white/5 border border-white/5';
    if (intensity < 0.2) return 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40';
    if (intensity < 0.4) return 'bg-cyan-800/70 text-cyan-300 border border-cyan-600/50';
    if (intensity < 0.7) return 'bg-cyan-600 text-slate-950 border border-cyan-400 shadow-sm';
    return 'bg-cyan-400 text-slate-950 border border-cyan-200 shadow-md shadow-cyan-400/40 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <GlassCard className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold text-white">7×24 Activity Heatmap Matrix</h3>
              <HelpTooltip
                title="Activity Heatmap Matrix"
                content="Aggregates hourly traffic across the 7 days of the week. Cells with bright cyan colors indicate peak recurring transfer periods (e.g. daily backups, streaming, torrenting)."
                formula="Cell_Intensity = Slot_Bytes / Max_Recorded_Bytes"
              />
            </div>
            <p className="text-xs text-slate-400">
              Aggregated network density distribution across days of week and hours of day
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-white/5 border border-white/5" />
            <span className="w-3.5 h-3.5 rounded-sm bg-cyan-950/60 border border-cyan-800/40" />
            <span className="w-3.5 h-3.5 rounded-sm bg-cyan-800/70 border border-cyan-600/50" />
            <span className="w-3.5 h-3.5 rounded-sm bg-cyan-600" />
            <span className="w-3.5 h-3.5 rounded-sm bg-cyan-400 shadow-sm" />
          </div>
          <span>Peak ({formatBytes(maxBytes, unitPreference)})</span>
        </div>
      </GlassCard>

      {/* 7x24 Matrix Grid */}
      <GlassCard className="p-6 space-y-4 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Hour Headers (0 to 23) */}
          <div className="grid grid-cols-[64px_repeat(24,1fr)_80px] gap-1.5 mb-2 text-center text-[10px] font-mono text-slate-400">
            <div className="text-left font-semibold text-slate-400">Day \ Hr</div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="truncate">
                {h}h
              </div>
            ))}
            <div className="font-semibold text-right">Day Total</div>
          </div>

          {/* Matrix Rows (Sunday to Saturday) */}
          <div className="space-y-1.5">
            {dayLabels.map((dayName, dIdx) => (
              <div
                key={dayName}
                className="grid grid-cols-[64px_repeat(24,1fr)_80px] gap-1.5 items-center"
              >
                <div className="text-xs font-semibold text-slate-300 font-mono">{dayName}</div>

                {Array.from({ length: 24 }).map((_, hIdx) => {
                  const intensity = matrix[dIdx][hIdx];
                  const bytes = intensity * maxBytes;

                  return (
                    <div
                      key={hIdx}
                      onMouseEnter={() =>
                        setHoveredCell({ day: dIdx, hour: hIdx, intensity })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`
                        h-8 rounded-lg cursor-pointer transition-all duration-150 relative group
                        hover:scale-110 hover:z-20
                        ${getCellColor(intensity)}
                      `}
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-slate-900 border border-white/20 text-[10px] font-mono shadow-2xl backdrop-blur-2xl z-50 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {dayName} at {String(hIdx).padStart(2, '0')}:00
                        </div>
                        <div className="text-cyan-400">
                          Volume: {formatBytes(bytes, unitPreference)}
                        </div>
                        <div className="text-slate-400">
                          Intensity: {(intensity * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="text-right text-xs font-mono font-medium text-slate-300 truncate">
                  {formatBytes(dayTotals[dIdx], unitPreference)}
                </div>
              </div>
            ))}
          </div>

          {/* Hourly Totals Footer Row */}
          <div className="grid grid-cols-[64px_repeat(24,1fr)_80px] gap-1.5 mt-3 pt-3 border-t border-white/10 text-center text-[9px] font-mono text-slate-400">
            <div className="text-left font-semibold text-slate-400">Hr Total</div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="truncate">
                {formatBytes(hourTotals[h], unitPreference, 0)}
              </div>
            ))}
            <div className="text-right font-bold text-white">
              {formatBytes(
                dayTotals.reduce((a, b) => a + b, 0),
                unitPreference
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Hover Inspection Callout */}
      {hoveredCell && (
        <GlassCard className="p-4 flex items-center justify-between border-cyan-500/30 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">
              Inspecting {dayLabels[hoveredCell.day]} at {String(hoveredCell.hour).padStart(2, '0')}:00:
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              {formatBytes(hoveredCell.intensity * maxBytes, unitPreference)}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {(hoveredCell.intensity * 100).toFixed(1)}% of maximum recorded hour
          </span>
        </GlassCard>
      )}
    </div>
  );
};
