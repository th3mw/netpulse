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

  const getCellStyle = (intensity: number): React.CSSProperties => {
    if (intensity === 0) {
      return {
        backgroundColor: 'var(--bg-input)',
        borderColor: 'var(--border-subtle)',
      };
    }
    const pct = Math.max(15, Math.min(100, Math.round(intensity * 85 + 15)));
    return {
      backgroundColor: `color-mix(in srgb, var(--accent-primary) ${pct}%, var(--bg-surface))`,
      borderColor: 'var(--accent-primary-border)',
      boxShadow: intensity > 0.6 ? '0 0 10px -2px var(--accent-primary-border)' : undefined,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <GlassCard className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--accent-primary-subtle)',
              borderColor: 'var(--accent-primary-border)',
              color: 'var(--accent-primary)',
            }}
          >
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
                7×24 Activity Heatmap Matrix
              </h3>
              <HelpTooltip
                title="Activity Heatmap Matrix"
                content="Aggregates hourly traffic across the 7 days of the week. Cells with bright colors indicate peak recurring transfer periods (e.g. daily backups, streaming, torrenting)."
                formula="Cell_Intensity = Slot_Bytes / Max_Recorded_Bytes"
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Aggregated network density distribution across days of week and hours of day
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
            />
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-primary) 25%, var(--bg-surface))',
                borderColor: 'var(--border-subtle)',
              }}
            />
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-primary) 50%, var(--bg-surface))',
                borderColor: 'var(--accent-primary-border)',
              }}
            />
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent-primary) 75%, var(--bg-surface))',
                borderColor: 'var(--accent-primary-border)',
              }}
            />
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{
                backgroundColor: 'var(--accent-primary)',
                borderColor: 'var(--accent-primary-border)',
              }}
            />
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

                  const isTopRows = dIdx < 2;
                  const isRightCols = hIdx >= 21;
                  const isLeftCols = hIdx <= 2;

                  return (
                    <div
                      key={hIdx}
                      onMouseEnter={() =>
                        setHoveredCell({ day: dIdx, hour: hIdx, intensity })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      style={getCellStyle(intensity)}
                      className="h-8 rounded-lg cursor-pointer transition-all duration-150 relative group hover:scale-110 hover:z-20 border"
                    >
                      {/* Tooltip */}
                      <div
                        className={`opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute mb-2 p-2 rounded-xl border text-[10px] font-mono shadow-2xl backdrop-blur-2xl z-50 whitespace-nowrap ${
                          isTopRows ? 'top-full mt-2' : 'bottom-full mb-2'
                        } ${
                          isRightCols ? 'right-0' : isLeftCols ? 'left-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-card)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <div className="font-semibold">
                          {dayName} at {String(hIdx).padStart(2, '0')}:00
                        </div>
                        <div style={{ color: 'var(--accent-primary)' }}>
                          Volume: {formatBytes(bytes, unitPreference)}
                        </div>
                        <div style={{ color: 'var(--text-dim)' }}>
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
