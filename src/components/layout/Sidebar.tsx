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
  Network,
  ArrowDown,
  ArrowUp,
  ChevronDown,
} from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import type { NavigationTab, UnitPreference } from '../../types/vnstat';
import { formatRate } from '../../lib/formatters';
import { SegmentedControl } from '../ui/SegmentedControl';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
    ],
  },
];

export const Sidebar: React.FC = () => {
  const {
    interfaces,
    selectedInterface,
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
    <aside className="w-64 h-full flex flex-col bg-slate-950/80 border-r border-white/8 backdrop-blur-2xl select-none relative z-20">
      {/* App Header & Interface Switcher */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Network className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white leading-tight">
                VNstat
              </h1>
              <span className="text-[10px] text-slate-400 font-mono">v2.13 macOS Edition</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Interface Dropdown Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIfaceDropdownOpen(!ifaceDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all apple-press text-left"
          >
            <div className="flex items-center gap-2 truncate">
              <Wifi className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {selectedInterface}
                </div>
                {alias && <div className="text-[10px] text-slate-400 truncate">{alias}</div>}
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                ifaceDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {ifaceDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-2xl z-50">
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
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="font-mono">{iface.name}</span>
                  {iface.in_database && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
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
            <div className="px-2 mb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
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
                        ? 'bg-white/15 text-white shadow-sm border border-white/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
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
      <div className="p-3 border-t border-white/8 bg-slate-950/40 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowDown className="w-2.5 h-2.5 text-emerald-400" /> RX
            </span>
            <span className="font-mono font-medium text-emerald-400 truncate tabular-nums">
              {formatRate(currentLive?.rx_bytes_per_sec || 0, unitPreference)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowUp className="w-2.5 h-2.5 text-purple-400" /> TX
            </span>
            <span className="font-mono font-medium text-purple-400 truncate tabular-nums">
              {formatRate(currentLive?.tx_bytes_per_sec || 0, unitPreference)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 font-medium">Unit:</span>
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
