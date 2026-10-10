import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Download, Layers, Palette, Check } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { AppleButton } from '../ui/AppleButton';
import { formatDate } from '../../lib/formatters';
import { APP_THEMES } from '../../lib/themes';

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
    subtitle: 'Monthly quota allowance, billing cycle start day, interface aliases, and themes',
  },
  help: {
    title: 'Documentation & Help Guide',
    subtitle: 'Detailed explanations of network telemetry, formulas, unit conversions, and daemon commands',
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
    theme,
    setTheme,
  } = useNetworkStore();

  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const activeIface = vnstatData?.interfaces.find((i) => i.name === selectedInterface);
  const info = titlesMap[activeTab] || { title: 'Telemetry', subtitle: '' };

  useEffect(() => {
    if (!themePickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemePickerOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [themePickerOpen]);

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
    <header
      className="h-16 px-6 border-b backdrop-blur-xl flex items-center justify-between select-none relative z-10 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-header)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-main)' }}>
            {info.title}
          </h2>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-mono font-medium border"
            style={{
              backgroundColor: 'var(--accent-primary-subtle)',
              borderColor: 'var(--accent-primary-border)',
              color: 'var(--accent-primary)',
            }}
          >
            {selectedInterface}
          </span>
          {activeIface?.created && (
            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              Tracked since {formatDate(activeIface.created.date)}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {info.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {exportSuccess && (
          <span
            className="text-xs px-2.5 py-1 rounded-lg animate-fade-in border font-medium"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              borderColor: 'rgba(16, 185, 129, 0.25)',
              color: 'var(--accent-rx)',
            }}
          >
            {exportSuccess}
          </span>
        )}

        {/* Quick Theme Switcher */}
        <div className="relative" ref={themeMenuRef}>
          <AppleButton
            size="sm"
            variant="glass"
            icon={<Palette className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />}
            onClick={() => setThemePickerOpen(!themePickerOpen)}
          >
            <span className="capitalize">{theme.replace('-', ' ')}</span>
          </AppleButton>

          {themePickerOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl border shadow-2xl backdrop-blur-2xl z-50 animate-fade-in space-y-1"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-card)',
              }}
            >
              <div
                className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase border-b mb-1 flex items-center justify-between"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-dim)',
                }}
              >
                <span>Select Appearance Theme</span>
                <span className="text-[9px] font-mono font-normal">6 Available</span>
              </div>

              {APP_THEMES.map((t) => {
                const isSelected = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setThemePickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all apple-press ${
                      isSelected ? 'font-semibold' : 'hover:bg-white/5'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'var(--accent-primary-subtle)',
                            color: 'var(--text-main)',
                          }
                        : {
                            color: 'var(--text-muted)',
                          }
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Swatch dots */}
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: t.previewColors.bg }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: t.previewColors.accent }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: t.previewColors.rx }}
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-xs leading-none">{t.name}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{t.category}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
