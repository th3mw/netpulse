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

  // Build SVG polygon points for 60-second stream
  const width = 800;
  const height = 240;

  const getCoordinates = (rates: number[]) => {
    return rates
      .map((val, idx) => {
        const x = (idx / (60 - 1)) * width;
        const y = height - (val / maxLiveRate) * (height - 20) - 10;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const rxPoints = getCoordinates(liveHistory.map((s) => s.rx_bytes_per_sec));
  const txPoints = getCoordinates(liveHistory.map((s) => s.tx_bytes_per_sec));

  return (
    <div className="space-y-6">
      {/* Speedometer Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Speedometer */}
        <GlassCard className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/20 to-transparent blur-3xl opacity-50 pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ArrowDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Download Throughput
                </span>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Receiving Live
                </div>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
              {formatPackets(currentLive?.rx_packets_per_sec || 0)}
            </span>
          </div>

          <div className="py-2">
            <div className="text-4xl md:text-5xl font-bold text-white tracking-tight tabular-nums font-mono">
              {formatRate(currentLive?.rx_bytes_per_sec || 0, unitPreference)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5 text-xs text-slate-400">
            <span>Session Peak:</span>
            <span className="font-mono font-semibold text-emerald-400">
              {formatRate(peakLiveRx, unitPreference)}
            </span>
          </div>
        </GlassCard>

        {/* Upload Speedometer */}
        <GlassCard className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/20 to-transparent blur-3xl opacity-50 pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Upload Throughput
                </span>
                <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  Transmitting Live
                </div>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
              {formatPackets(currentLive?.tx_packets_per_sec || 0)}
            </span>
          </div>

          <div className="py-2">
            <div className="text-4xl md:text-5xl font-bold text-white tracking-tight tabular-nums font-mono">
              {formatRate(currentLive?.tx_bytes_per_sec || 0, unitPreference)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5 text-xs text-slate-400">
            <span>Session Peak:</span>
            <span className="font-mono font-semibold text-purple-400">
              {formatRate(peakLiveTx, unitPreference)}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* 60-Second Real-Time Area Chart */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Rolling 60-Second Bandwidth Stream
              </h3>
              <p className="text-xs text-slate-400">
                Real-time 1000ms polling from /proc/net/dev on {selectedInterface}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              RX: {formatRate(hoveredSample ? hoveredSample.rx_bytes_per_sec : currentLive?.rx_bytes_per_sec || 0, unitPreference)}
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              TX: {formatRate(hoveredSample ? hoveredSample.tx_bytes_per_sec : currentLive?.tx_bytes_per_sec || 0, unitPreference)}
            </span>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative h-64 w-full bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden p-2">
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="border-b border-white text-[10px] text-slate-400 font-mono">
              {formatRate(maxLiveRate, unitPreference)}
            </div>
            <div className="border-b border-white text-[10px] text-slate-400 font-mono">
              {formatRate(maxLiveRate * 0.5, unitPreference)}
            </div>
            <div className="border-b border-white text-[10px] text-slate-400 font-mono">
              0 B/s
            </div>
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* RX Area & Line */}
            {liveHistory.length > 1 && (
              <>
                <polygon
                  points={`0,${height} ${rxPoints} ${((liveHistory.length - 1) / (60 - 1)) * width},${height}`}
                  fill="url(#rxGradient)"
                />
                <polyline
                  points={rxPoints}
                  fill="none"
                  stroke="#10b981"
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
                  points={`0,${height} ${txPoints} ${((liveHistory.length - 1) / (60 - 1)) * width},${height}`}
                  fill="url(#txGradient)"
                />
                <polyline
                  points={txPoints}
                  fill="none"
                  stroke="#a855f7"
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
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>T-60s</span>
          <span>Sample Frequency: 1.0s (Kernel /proc/net/dev)</span>
          <span>Live Now</span>
        </div>
      </GlassCard>

      {/* Session Diagnostics Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Session Downloaded</span>
            <div className="text-base font-bold text-white font-mono">
              {formatBytes(sessionRxTotal, unitPreference)}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Session Uploaded</span>
            <div className="text-base font-bold text-white font-mono">
              {formatBytes(sessionTxTotal, unitPreference)}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Monitor Status</span>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Streaming
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
