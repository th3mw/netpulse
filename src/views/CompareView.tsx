import { ArrowLeftRight, Wifi, Shield, Network, ArrowDown, ArrowUp, CheckCircle } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { AppleButton } from '../components/ui/AppleButton';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { formatBytes } from '../lib/formatters';
import type { InterfaceSummary } from '../types/vnstat';


export const CompareView: React.FC = () => {
  const { interfaces, selectedInterface, setSelectedInterface, setActiveTab, unitPreference } =
    useNetworkStore();

  const totalSysRx = interfaces.reduce((acc: number, i: InterfaceSummary) => acc + i.rx_bytes, 0);
  const totalSysTx = interfaces.reduce((acc: number, i: InterfaceSummary) => acc + i.tx_bytes, 0);
  const totalSysTraffic = totalSysRx + totalSysTx;

  return (
    <div className="space-y-6">
      {/* System Total Summary */}
      <GlassCard className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)',
              color: 'var(--accent-primary)',
            }}
          >
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
                Interface Comparative Analysis
              </h3>
              <HelpTooltip
                title="System-Wide Network Comparison"
                content="Aggregates and compares throughput share across all physical (Wi-Fi, Ethernet) and virtual (VPN, Docker bridges, WireGuard) network interfaces on the host."
                formula="Interface Share % = (NIC Traffic / Total System Traffic) * 100"
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Aggregated system traffic across all {interfaces.length} detected kernel interfaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div
            className="p-2.5 rounded-xl border text-right"
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>
                System Total Traffic
              </span>
              <HelpTooltip
                title="Cumulative System Traffic"
                content="Sum of received and transmitted bytes across all active and inactive network interfaces detected in /proc/net/dev."
                side="left"
              />
            </div>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>
              {formatBytes(totalSysTraffic, unitPreference)}
            </div>
          </div>
          <div
            className="p-2.5 rounded-xl text-right"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-rx) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent-rx) 25%, transparent)',
            }}
          >
            <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--accent-rx)' }}>
              System Total RX
            </span>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent-rx)' }}>
              {formatBytes(totalSysRx, unitPreference)}
            </div>
          </div>
          <div
            className="p-2.5 rounded-xl text-right"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-tx) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent-tx) 25%, transparent)',
            }}
          >
            <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--accent-tx)' }}>
              System Total TX
            </span>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent-tx)' }}>
              {formatBytes(totalSysTx, unitPreference)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Interface Traffic Distribution Bar */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            System Traffic Share Distribution
          </h4>
          <HelpTooltip
            title="Relative Traffic Partitioning"
            content="Color-segmented horizontal ratio bar illustrating percentage of total host bandwidth consumed by each distinct network adapter."
          />
        </div>

        <div
          className="h-4 w-full rounded-xl overflow-hidden flex border p-0.5"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          {interfaces
            .filter((i: InterfaceSummary) => i.rx_bytes + i.tx_bytes > 0)
            .map((iface: InterfaceSummary, idx: number) => {
              const traffic = iface.rx_bytes + iface.tx_bytes;
              const pct = totalSysTraffic > 0 ? (traffic / totalSysTraffic) * 100 : 0;
              const palette = [
                'var(--accent-primary)',
                'var(--accent-tx)',
                'var(--accent-rx)',
                '#3b82f6',
                '#f59e0b',
                '#ec4899',
              ];
              const bg = palette[idx % palette.length];

              return (
                <div
                  key={iface.name}
                  className="transition-all duration-300 h-full first:rounded-l-lg last:rounded-r-lg"
                  style={{ width: `${pct}%`, backgroundColor: bg }}
                  title={`${iface.name}: ${pct.toFixed(1)}%`}
                />
              );
            })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
          {interfaces
            .filter((i: InterfaceSummary) => i.rx_bytes + i.tx_bytes > 0)
            .map((iface: InterfaceSummary, idx: number) => {
              const traffic = iface.rx_bytes + iface.tx_bytes;
              const pct = totalSysTraffic > 0 ? (traffic / totalSysTraffic) * 100 : 0;
              const palette = [
                'var(--accent-primary)',
                'var(--accent-tx)',
                'var(--accent-rx)',
                '#3b82f6',
                '#f59e0b',
                '#ec4899',
              ];
              const dotColor = palette[idx % palette.length];

              return (
                <div key={iface.name} className="flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                  <span>{iface.name}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-dim)' }}>({pct.toFixed(1)}%)</span>
                </div>
              );
            })}
        </div>
      </GlassCard>

      {/* Interface Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interfaces.map((iface: InterfaceSummary) => {
          const isSelected = iface.name === selectedInterface;
          const ifaceTotal = iface.rx_bytes + iface.tx_bytes;
          const sharePct = totalSysTraffic > 0 ? (ifaceTotal / totalSysTraffic) * 100 : 0;

          return (
            <GlassCard
              key={iface.name}
              className="p-5 flex flex-col justify-between space-y-4 transition-all"
              style={{
                borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                boxShadow: isSelected ? '0 0 0 1.5px var(--accent-primary)' : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-xl"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {iface.name.includes('wlan') ? (
                      <Wifi className="w-4 h-4" />
                    ) : iface.name.includes('WARP') ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <Network className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-mono" style={{ color: 'var(--text-main)' }}>{iface.name}</h4>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {iface.in_database ? 'Tracked in vnStat DB' : 'System Device Only'}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
                      color: 'var(--accent-primary)',
                      border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)',
                    }}
                  >
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{sharePct.toFixed(1)}%</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-main)' }}>
                  {formatBytes(ifaceTotal, unitPreference)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent-rx) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent-rx) 22%, transparent)',
                    }}
                  >
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--accent-rx)' }}>
                      <ArrowDown className="w-2.5 h-2.5" /> RX
                    </span>
                    <span className="font-medium truncate block mt-0.5" style={{ color: 'var(--accent-rx)' }}>
                      {formatBytes(iface.rx_bytes, unitPreference)}
                    </span>
                  </div>
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent-tx) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent-tx) 22%, transparent)',
                    }}
                  >
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--accent-tx)' }}>
                      <ArrowUp className="w-2.5 h-2.5" /> TX
                    </span>
                    <span className="font-medium truncate block mt-0.5" style={{ color: 'var(--accent-tx)' }}>
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
