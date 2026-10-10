import React from 'react';
import {
  Activity,
  Radio,
  Clock,
  BarChart3,
  Calendar,
  TrendingUp,
  Archive,
  Trophy,
  Grid,
  ArrowLeftRight,
  Settings,
  Wifi,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  HelpCircle,
  Star,
} from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import type { NavigationTab, UnitPreference } from '../../types/vnstat';
import { formatRate } from '../../lib/formatters';
import { SegmentedControl } from '../ui/SegmentedControl';
import appLogo from '../../assets/logo.png';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Monitor',
    items: [
      { id: 'overview', label: 'Overview', icon: Activity },
      { id: 'live', label: 'Live Cockpit', icon: Radio },
    ],
  },
  {
    title: 'Telemetry Intervals',
    items: [
      { id: 'fiveminute', label: '5-Minute Slots', icon: Clock },
      { id: 'hourly', label: 'Hourly Timeline', icon: BarChart3 },
      { id: 'daily', label: 'Daily History', icon: Calendar },
      { id: 'monthly', label: 'Monthly Trends', icon: TrendingUp },
      { id: 'yearly', label: 'Yearly Logs', icon: Archive },
      { id: 'top', label: 'Top Records', icon: Trophy },
    ],
  },
  {
    title: 'Analytics & Config',
    items: [
      { id: 'heatmap', label: 'Activity Heatmap', icon: Grid },
      { id: 'compare', label: 'Compare Interfaces', icon: ArrowLeftRight },
      { id: 'settings', label: 'Settings & Quota', icon: Settings },
      { id: 'help', label: 'Help & Knowledge', icon: HelpCircle },
    ],
  },
];


export const Sidebar: React.FC = () => {
  const {
    interfaces,
    selectedInterface,
    defaultInterface,
    setSelectedInterface,
    activeTab,
    setActiveTab,
    currentLive,
    unitPreference,
    setUnitPreference,
    vnstatData,
  } = useNetworkStore();

  const [ifaceDropdownOpen, setIfaceDropdownOpen] = React.useState(false);

  const alias = vnstatData?.interfaces.find((i) => i.name === selectedInterface)?.alias;


  return (
    <aside
      className="w-64 h-full flex flex-col border-r backdrop-blur-2xl select-none relative z-20 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* App Header & Interface Switcher */}
      <div
        className="p-4 border-b transition-colors duration-300"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={appLogo}
              alt="NetPulse"
              className="w-7 h-7 rounded-lg shadow-md border object-cover shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}
            />
            <div>
              <h1 className="text-sm font-semibold tracking-tight leading-tight" style={{ color: 'var(--text-main)' }}>
                NetPulse
              </h1>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                vnStat Telemetry
              </span>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.25)',
              color: 'var(--accent-rx)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--accent-rx)' }}
            />
            LIVE
          </div>
        </div>

        {/* Interface Dropdown Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIfaceDropdownOpen(!ifaceDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all apple-press text-left"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-2 truncate">
              <Wifi className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
              <div className="truncate">
                <div className="text-xs font-semibold truncate flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                  <span>{selectedInterface}</span>
                  {selectedInterface === defaultInterface && (
                    <span title="Default Interface" className="inline-flex items-center">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    </span>
                  )}
                </div>
                {alias && <div className="text-[10px] truncate" style={{ color: 'var(--text-dim)' }}>{alias}</div>}
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                ifaceDropdownOpen ? 'rotate-180' : ''
              }`}
              style={{ color: 'var(--text-dim)' }}
            />
          </button>

          {ifaceDropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-xl border shadow-2xl backdrop-blur-2xl z-50"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-card)',
              }}
            >
              {interfaces.map((iface) => (
                <button
                  key={iface.name}
                  type="button"
                  onClick={() => {
                    setSelectedInterface(iface.name);
                    setIfaceDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors apple-press ${
                    iface.name === selectedInterface
                      ? 'font-semibold'
                      : 'hover:bg-white/10'
                  }`}
                  style={
                    iface.name === selectedInterface
                      ? {
                          backgroundColor: 'var(--accent-primary-subtle)',
                          color: 'var(--accent-primary)',
                        }
                      : { color: 'var(--text-main)' }
                  }
                >
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>{iface.name}</span>
                    {iface.name === defaultInterface && (
                      <span title="Default Interface" className="inline-flex items-center">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  {iface.in_database && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-dim)',
                      }}
                    >
                      db
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <div
              className="px-2 mb-1 text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: 'var(--text-dim)' }}
            >
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all apple-press ${
                      isActive
                        ? 'shadow-sm border font-semibold'
                        : 'hover:bg-white/5'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: 'var(--accent-primary-subtle)',
                            borderColor: 'var(--accent-primary-border)',
                            color: 'var(--text-main)',
                          }
                        : {
                            color: 'var(--text-muted)',
                          }
                    }
                  >
                    <Icon
                      className="w-4 h-4 transition-colors"
                      style={{
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-dim)',
                      }}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Live Mini Readout & Unit Toggle Footer */}
      <div
        className="p-3 border-t space-y-2.5 transition-colors duration-300"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-input)',
        }}
      >
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div
            className="p-2 rounded-xl border flex flex-col"
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-dim)' }}>
              <ArrowDown className="w-2.5 h-2.5" style={{ color: 'var(--accent-rx)' }} /> RX
            </span>
            <span
              className="font-mono font-medium truncate tabular-nums"
              style={{ color: 'var(--accent-rx)' }}
            >
              {formatRate(currentLive?.rx_bytes_per_sec || 0, unitPreference)}
            </span>
          </div>
          <div
            className="p-2 rounded-xl border flex flex-col"
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-dim)' }}>
              <ArrowUp className="w-2.5 h-2.5" style={{ color: 'var(--accent-tx)' }} /> TX
            </span>
            <span
              className="font-mono font-medium truncate tabular-nums"
              style={{ color: 'var(--accent-tx)' }}
            >
              {formatRate(currentLive?.tx_bytes_per_sec || 0, unitPreference)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-dim)' }}>Unit:</span>
          <SegmentedControl<UnitPreference>
            id="unit-pref-selector"
            options={[
              { value: 'SI', label: 'SI' },
              { value: 'IEC', label: 'IEC' },
              { value: 'BITS', label: 'Bits' },
            ]}
            value={unitPreference}
            onChange={setUnitPreference}
          />
        </div>
      </div>
    </aside>
  );
};
