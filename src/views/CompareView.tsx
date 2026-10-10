import React from 'react';
import { ArrowLeftRight, Wifi, Shield, Network, ArrowDown, ArrowUp, CheckCircle } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { GlassCard } from '../ui/GlassCard';
import { AppleButton } from '../ui/AppleButton';
import { formatBytes } from '../../lib/formatters';

export const CompareView: React.FC = () => {
  const { interfaces, selectedInterface, setSelectedInterface, setActiveTab, unitPreference } =
    useNetworkStore();

  const totalSysRx = interfaces.reduce((acc, i) => acc + i.rx_bytes, 0);
  const totalSysTx = interfaces.reduce((acc, i) => acc + i.tx_bytes, 0);
  const totalSysTraffic = totalSysRx + totalSysTx;

  return (
    <div className="space-y-6">
      {/* System Total Summary */}
      <GlassCard className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Interface Comparative Analysis</h3>
            <p className="text-xs text-slate-400">
              Aggregated system traffic across all {interfaces.length} detected kernel interfaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-right">
            <span className="text-[10px] text-slate-400 uppercase">System Total Traffic</span>
            <div className="text-sm font-bold text-white mt-0.5">
              {formatBytes(totalSysTraffic, unitPreference)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right">
            <span className="text-[10px] text-emerald-400 uppercase">System Total RX</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              {formatBytes(totalSysRx, unitPreference)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
            <span className="text-[10px] text-purple-400 uppercase">System Total TX</span>
            <div className="text-sm font-bold text-purple-400 mt-0.5">
              {formatBytes(totalSysTx, unitPreference)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Interface Traffic Distribution Bar */}
      <GlassCard className="p-5 space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          System Traffic Share Distribution
        </h4>

        <div className="h-4 w-full rounded-xl overflow-hidden flex border border-white/10 p-0.5 bg-slate-900/80">
          {interfaces
            .filter((i) => i.rx_bytes + i.tx_bytes > 0)
            .map((iface, idx) => {
              const traffic = iface.rx_bytes + iface.tx_bytes;
              const pct = totalSysTraffic > 0 ? (traffic / totalSysTraffic) * 100 : 0;
              const colors = [
                'bg-cyan-500',
                'bg-purple-500',
                'bg-emerald-500',
                'bg-amber-500',
                'bg-rose-500',
                'bg-blue-500',
              ];
              const bg = colors[idx % colors.length];

              return (
                <div
                  key={iface.name}
                  className={`${bg} transition-all duration-300 h-full first:rounded-l-lg last:rounded-r-lg`}
                  style={{ width: `${pct}%` }}
                  title={`${iface.name}: ${pct.toFixed(1)}%`}
                />
              );
            })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
          {interfaces
            .filter((i) => i.rx_bytes + i.tx_bytes > 0)
            .map((iface, idx) => {
              const traffic = iface.rx_bytes + iface.tx_bytes;
              const pct = totalSysTraffic > 0 ? (traffic / totalSysTraffic) * 100 : 0;
              const colors = [
                'bg-cyan-500',
                'bg-purple-500',
                'bg-emerald-500',
                'bg-amber-500',
                'bg-rose-500',
                'bg-blue-500',
              ];
              const dotColor = colors[idx % colors.length];

              return (
                <div key={iface.name} className="flex items-center gap-1.5 text-slate-300">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span>{iface.name}</span>
                  <span className="text-slate-500 font-semibold">({pct.toFixed(1)}%)</span>
                </div>
              );
            })}
        </div>
      </GlassCard>

      {/* Interface Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interfaces.map((iface) => {
          const isSelected = iface.name === selectedInterface;
          const ifaceTotal = iface.rx_bytes + iface.tx_bytes;
          const sharePct = totalSysTraffic > 0 ? (ifaceTotal / totalSysTraffic) * 100 : 0;

          return (
            <GlassCard
              key={iface.name}
              className={`p-5 flex flex-col justify-between space-y-4 transition-all ${
                isSelected ? 'ring-2 ring-cyan-500/80 bg-slate-900/90' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-cyan-400">
                    {iface.name.includes('wlan') ? (
                      <Wifi className="w-4 h-4" />
                    ) : iface.name.includes('WARP') ? (
                      <Shield className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Network className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{iface.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      {iface.in_database ? 'Tracked in vnStat DB' : 'System Device Only'}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-400">{sharePct.toFixed(1)}%</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold text-white font-mono">
                  {formatBytes(ifaceTotal, unitPreference)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <ArrowDown className="w-2.5 h-2.5" /> RX
                    </span>
                    <span className="text-emerald-300 font-medium truncate block mt-0.5">
                      {formatBytes(iface.rx_bytes, unitPreference)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] text-purple-400 flex items-center gap-0.5">
                      <ArrowUp className="w-2.5 h-2.5" /> TX
                    </span>
                    <span className="text-purple-300 font-medium truncate block mt-0.5">
                      {formatBytes(iface.tx_bytes, unitPreference)}
                    </span>
                  </div>
                </div>
              </div>

              <AppleButton
                size="sm"
                variant={isSelected ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => {
                  setSelectedInterface(iface.name);
                  setActiveTab('overview');
                }}
              >
                {isSelected ? 'View Dashboard' : 'Switch & Inspect'}
              </AppleButton>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
