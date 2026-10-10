import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Zap,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { formatBytes, formatPackets, formatRate } from '../lib/formatters';

export const LiveMonitorView: React.FC = () => {
  const {
    currentLive,
    liveHistory,
    peakLiveRx,
    peakLiveTx,
    unitPreference,
    selectedInterface,
  } = useNetworkStore();

  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  // Compute live session totals from history
  const sessionRxTotal = liveHistory.reduce((acc, s) => acc + s.rx_bytes_per_sec, 0);
  const sessionTxTotal = liveHistory.reduce((acc, s) => acc + s.tx_bytes_per_sec, 0);

  // Max rate in rolling window for scaling chart
  const maxLiveRate = Math.max(
    ...liveHistory.map((s) => Math.max(s.rx_bytes_per_sec, s.tx_bytes_per_sec)),
    100 * 1024 // min 100 KB/s ceiling
  );

  const hoveredSample = hoverIndex !== null && liveHistory[hoverIndex] ? liveHistory[hoverIndex] : null;

  const width = 800;
  const height = 240;

  const getCoordinates = (rates: number[]) => {
    return rates
      .map((val, idx) => {
        const x = (idx / (60 - 1)) * width;
        const clampedVal = Math.min(Math.max(val, 0), maxLiveRate);
        const y = height - (clampedVal / maxLiveRate) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const rxPoints = getCoordinates(liveHistory.map((s) => s.rx_bytes_per_sec));
  const txPoints = getCoordinates(liveHistory.map((s) => s.tx_bytes_per_sec));
  const currentLastIndex = Math.max(0, liveHistory.length - 1);
  const currentEndX = ((currentLastIndex / (60 - 1)) * width).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Speedometer Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Speedometer */}
        <GlassCard className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute top-0 right-0 w-48 h-48 blur-3xl opacity-30 pointer-events-none rounded-full"
            style={{ backgroundColor: 'var(--accent-rx)' }}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-xl border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent-rx) 12%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-rx) 25%, transparent)',
                  color: 'var(--accent-rx)',
                }}
              >
                <ArrowDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Download Throughput
                  </span>
                  <HelpTooltip
                    title="Real-Time Download Rate (RX)"
                    content="Instantaneous bytes received per second by the kernel on this interface, updated every 1000ms."
                    formula="(rx_bytes_now - rx_bytes_prev) / elapsed_seconds"
                  />
                </div>
                <div className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--accent-rx)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent-rx)' }} />
                  Receiving Live
                </div>
              </div>
            </div>
            <span
              className="text-xs font-mono border px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-dim)',
              }}
            >
              {formatPackets(currentLive?.rx_packets_per_sec || 0)}
            </span>
          </div>

          <div className="py-2">
            <div className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums font-mono" style={{ color: 'var(--text-main)' }}>
              {formatRate(currentLive?.rx_bytes_per_sec || 0, unitPreference)}
            </div>
          </div>

          <div
            className="flex items-center justify-between pt-4 mt-2 border-t text-xs"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <span>Session Peak:</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--accent-rx)' }}>
              {formatRate(peakLiveRx, unitPreference)}
            </span>
          </div>
        </GlassCard>

        {/* Upload Speedometer */}
        <GlassCard className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute top-0 right-0 w-48 h-48 blur-3xl opacity-30 pointer-events-none rounded-full"
            style={{ backgroundColor: 'var(--accent-tx)' }}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-xl border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent-tx) 12%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent-tx) 25%, transparent)',
                  color: 'var(--accent-tx)',
                }}
              >
                <ArrowUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Upload Throughput
                  </span>
                  <HelpTooltip
                    title="Real-Time Upload Rate (TX)"
                    content="Instantaneous bytes transmitted per second by the kernel on this interface, updated every 1000ms."
                    formula="(tx_bytes_now - tx_bytes_prev) / elapsed_seconds"
                  />
                </div>
                <div className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--accent-tx)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent-tx)' }} />
                  Transmitting Live
                </div>
              </div>
            </div>
            <span
              className="text-xs font-mono border px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-dim)',
              }}
            >
              {formatPackets(currentLive?.tx_packets_per_sec || 0)}
            </span>
          </div>

          <div className="py-2">
            <div className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums font-mono" style={{ color: 'var(--text-main)' }}>
              {formatRate(currentLive?.tx_bytes_per_sec || 0, unitPreference)}
            </div>
          </div>

          <div
            className="flex items-center justify-between pt-4 mt-2 border-t text-xs"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <span>Session Peak:</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--accent-tx)' }}>
              {formatRate(peakLiveTx, unitPreference)}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* 60-Second Real-Time Area Chart */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: 'var(--accent-primary-subtle)',
                borderColor: 'var(--accent-primary-border)',
                color: 'var(--accent-primary)',
              }}
            >
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                  Rolling 60-Second Bandwidth Stream
                </h3>
                <HelpTooltip
                  title="60-Second Stream Chart"
                  content="Streaming SVG area graph of bandwidth over the past 60 seconds. Scrub your pointer horizontally across the graph to inspect exact throughput at any second."
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Real-time 1000ms polling from /proc/net/dev on {selectedInterface}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--accent-rx)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-rx)' }} />
              RX: {formatRate(hoveredSample ? hoveredSample.rx_bytes_per_sec : currentLive?.rx_bytes_per_sec || 0, unitPreference)}
            </span>
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--accent-tx)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-tx)' }} />
              TX: {formatRate(hoveredSample ? hoveredSample.tx_bytes_per_sec : currentLive?.tx_bytes_per_sec || 0, unitPreference)}
            </span>
          </div>
        </div>

        {/* Chart with dedicated Y-Axis on the side */}
        <div className="flex gap-3 h-64 w-full">
          {/* Dedicated Y-Axis Benchmark Column */}
          <div
            className="w-20 md:w-24 shrink-0 flex flex-col justify-between items-end font-mono text-[11px] select-none py-0.5"
            style={{ color: 'var(--text-dim)' }}
          >
            <span>{formatRate(maxLiveRate, unitPreference)}</span>
            <span>{formatRate(maxLiveRate * 0.75, unitPreference)}</span>
            <span>{formatRate(maxLiveRate * 0.5, unitPreference)}</span>
            <span>{formatRate(maxLiveRate * 0.25, unitPreference)}</span>
            <span>0 B/s</span>
          </div>

          {/* SVG Chart Canvas */}
          <div
            className="relative flex-1 h-full min-w-0 rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Background horizontal grid lines aligned with Y-axis benchmarks */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full border-b" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="w-full border-b border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="w-full border-b border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="w-full border-b border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="w-full border-b" style={{ borderColor: 'var(--border-subtle)' }} />
            </div>

            {/* Vertical grid lines (every 15s) */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10 px-[1px]">
              <div className="h-full border-r border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="h-full border-r border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="h-full border-r border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="h-full border-r border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
              <div className="h-full border-r border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
            </div>

            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-hidden"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-rx)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--accent-rx)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-tx)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--accent-tx)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* RX Area & Line */}
              {liveHistory.length > 1 && (
                <>
                  <polygon
                    points={`0,${height} ${rxPoints} ${currentEndX},${height}`}
                    fill="url(#rxGradient)"
                  />
                  <polyline
                    points={rxPoints}
                    fill="none"
                    stroke="var(--accent-rx)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* TX Area & Line */}
              {liveHistory.length > 1 && (
                <>
                  <polygon
                    points={`0,${height} ${txPoints} ${currentEndX},${height}`}
                    fill="url(#txGradient)"
                  />
                  <polyline
                    points={txPoints}
                    fill="none"
                    stroke="var(--accent-tx)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>

            {/* Mouse scrub overlay */}
            <div
              className="absolute inset-0 flex"
              onMouseLeave={() => setHoverIndex(null)}
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-full cursor-crosshair hover:bg-white/5 transition-colors"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              ))}
            </div>

            {/* Scrub vertical guideline */}
            {hoverIndex !== null && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none border-l-2 border-dashed z-10"
                style={{
                  left: `${(hoverIndex / (60 - 1)) * 100}%`,
                  borderColor: 'var(--accent-primary)',
                }}
              />
            )}
          </div>
        </div>

        {/* Time Benchmarks X-Axis */}
        <div className="flex items-center gap-3">
          <div className="w-20 md:w-24 shrink-0" />
          <div
            className="flex-1 flex justify-between items-center text-[11px] font-mono select-none px-1"
            style={{ color: 'var(--text-dim)' }}
          >
            <span>-60s</span>
            <span>-45s</span>
            <span>-30s</span>
            <span>-15s</span>
            <span>Now</span>
          </div>
        </div>
      </GlassCard>

      {/* Session Diagnostics Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-rx) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-rx) 25%, transparent)',
              color: 'var(--accent-rx)',
            }}
          >
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>Session Downloaded</span>
              <HelpTooltip
                title="Session Downloaded"
                content="Total download volume recorded in memory since launching the app."
              />
            </div>
            <div className="text-base font-bold font-mono" style={{ color: 'var(--text-main)' }}>
              {formatBytes(sessionRxTotal, unitPreference)}
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
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>Session Uploaded</span>
              <HelpTooltip
                title="Session Uploaded"
                content="Total upload volume recorded in memory since launching the app."
              />
            </div>
            <div className="text-base font-bold font-mono" style={{ color: 'var(--text-main)' }}>
              {formatBytes(sessionTxTotal, unitPreference)}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)',
              color: 'var(--accent-primary)',
            }}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>Monitor Status</span>
              <HelpTooltip
                title="Kernel Streaming Engine"
                content="Rust background task polls Linux /proc/net/dev every 1000ms with non-blocking async timers."
              />
            </div>
            <div className="text-base font-bold flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-primary)' }} />
              Active Streaming
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
