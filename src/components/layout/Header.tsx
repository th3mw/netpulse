import React from 'react';
import { RefreshCw, Download, Layers } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { AppleButton } from '../ui/AppleButton';
import { formatDate } from '../../lib/formatters';

const titlesMap: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview Dashboard',
    subtitle: 'Summary bandwidth metrics, run-rate forecast, and recent activity',
  },
  live: {
    title: 'Live Cockpit',
    subtitle: 'High-frequency sub-second bandwidth stream and rolling 60s window',
  },
  fiveminute: {
    title: '5-Minute Slots',
    subtitle: 'Granular 5-minute sampling log and recent micro-bursts',
  },
  hourly: {
    title: 'Hourly Timeline',
    subtitle: '24-hour distribution profile, peak transfer hours, and 95th percentile',
  },
  daily: {
    title: 'Daily History',
    subtitle: 'Day-by-day logs, weekday vs weekend comparison, and averages',
  },
  monthly: {
    title: 'Monthly Trends',
    subtitle: 'Monthly volume records, billing cycle burn-rate, and seasonal pattern',
  },
  yearly: {
    title: 'Yearly Logs',
    subtitle: 'Long-term cumulative telemetry and annual growth',
  },
  top: {
    title: 'Top Records',
    subtitle: 'All-time leaderboard of highest traffic days recorded by vnstat',
  },
  heatmap: {
    title: 'Activity Heatmap',
    subtitle: '7-day by 24-hour network density matrix for bandwidth profiling',
  },
  compare: {
    title: 'Compare Interfaces',
    subtitle: 'Side-by-side telemetry comparison across all tracked interfaces',
  },
  settings: {
    title: 'Settings & Quota',
    subtitle: 'Monthly quota allowance, billing cycle start day, and interface aliases',
  },
};

export const Header: React.FC = () => {
  const {
    activeTab,
    selectedInterface,
    vnstatData,
    fetchVnstatData,
    fetchPercentileReport,
    saveExport,
    isLoading,
  } = useNetworkStore();

  const [exporting, setExporting] = React.useState(false);
  const [exportSuccess, setExportSuccess] = React.useState<string | null>(null);

  const activeIface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const info = titlesMap[activeTab] || { title: 'Telemetry', subtitle: '' };

  const handleRefresh = async () => {
    await Promise.all([fetchVnstatData(), fetchPercentileReport()]);
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const path = await saveExport(format);
      setExportSuccess(`Saved to ${path}`);
      setTimeout(() => setExportSuccess(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="h-16 px-6 border-b border-white/8 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between select-none relative z-10">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-white tracking-tight">{info.title}</h2>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
            {selectedInterface}
          </span>
          {activeIface?.created && (
            <span className="text-[11px] text-slate-400">
              Tracked since {formatDate(activeIface.created.date)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {exportSuccess && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg animate-fade-in">
            {exportSuccess}
          </span>
        )}

        <AppleButton
          size="sm"
          variant="glass"
          icon={<Download className="w-3.5 h-3.5" />}
          disabled={exporting}
          onClick={() => handleExport('csv')}
        >
          CSV
        </AppleButton>

        <AppleButton
          size="sm"
          variant="glass"
          icon={<Layers className="w-3.5 h-3.5" />}
          disabled={exporting}
          onClick={() => handleExport('json')}
        >
          JSON
        </AppleButton>

        <AppleButton
          size="sm"
          variant="secondary"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={handleRefresh}
        >
          Refresh
        </AppleButton>
      </div>
    </header>
  );
};
