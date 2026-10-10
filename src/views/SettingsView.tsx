import React from 'react';
import {
  HardDrive,
  Download,
  Copy,
  Check,
  Tag,
  Database,
  Layers,
  RefreshCw,
  PlusCircle,
  Trash2,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { AppleButton } from '../components/ui/AppleButton';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { APP_THEMES } from '../lib/themes';
import type { UnitPreference, VnstatInterface, InterfaceSummary } from '../types/vnstat';
import { formatBytes } from '../lib/formatters';

export const SettingsView: React.FC = () => {
  const {
    billingConfig,
    setBillingConfig,
    unitPreference,
    setUnitPreference,
    selectedInterface,
    interfaces,
    vnstatData,
    setAlias,
    saveExport,
    addInterfaceToDb,
    removeInterfaceFromDb,
    updateDatabase,
    resetConfig,
    theme,
    setTheme,
  } = useNetworkStore();

  const activeIface = vnstatData?.interfaces.find((i: VnstatInterface) => i.name === selectedInterface);

  const [quotaGbInput, setQuotaGbInput] = React.useState(
    (billingConfig.monthlyQuotaBytes / (1000 * 1000 * 1000)).toString()
  );
  const [cycleDayInput, setCycleDayInput] = React.useState(
    billingConfig.cycleStartDay.toString()
  );
  const [thresholdInput, setThresholdInput] = React.useState(
    billingConfig.alertThresholdPercent.toString()
  );
  const [quotaEnabled, setQuotaEnabled] = React.useState(billingConfig.enabled);

  const [aliasInput, setAliasInput] = React.useState(activeIface?.alias || '');
  const [aliasSaved, setAliasSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [exportNotice, setExportNotice] = React.useState<string | null>(null);
  const [isUpdatingDb, setIsUpdatingDb] = React.useState(false);
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  // Sync alias input if active interface changes
  React.useEffect(() => {
    setAliasInput(activeIface?.alias || '');
  }, [activeIface?.alias]);

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    const gb = parseFloat(quotaGbInput) || 500;
    const day = parseInt(cycleDayInput, 10) || 1;
    const thresh = parseInt(thresholdInput, 10) || 85;
    setBillingConfig({
      monthlyQuotaBytes: gb * 1000 * 1000 * 1000,
      cycleStartDay: Math.max(1, Math.min(31, day)),
      alertThresholdPercent: Math.max(10, Math.min(100, thresh)),
      enabled: quotaEnabled,
    });
    setExportNotice('Billing and quota parameters successfully saved');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleSaveAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setAlias(aliasInput);
      setAliasSaved(true);
      setTimeout(() => setAliasSaved(false), 2500);
      setExportNotice(`Alias '${aliasInput}' saved for ${selectedInterface}`);
      setTimeout(() => setExportNotice(null), 3000);
    } catch (e) {
      console.error(e);
      setExportNotice(`Failed to save alias: ${String(e)}`);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const handleSyncDb = async () => {
    setIsUpdatingDb(true);
    try {
      const msg = await updateDatabase();
      setExportNotice(msg || 'Database synchronized with kernel counters');
    } catch (e) {
      setExportNotice(`Sync error: ${String(e)}`);
    } finally {
      setIsUpdatingDb(false);
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  const handleAddInterface = async (ifaceName: string) => {
    setActionInProgress(ifaceName);
    try {
      const msg = await addInterfaceToDb(ifaceName);
      setExportNotice(msg);
    } catch (e) {
      setExportNotice(`Error adding interface: ${String(e)}`);
    } finally {
      setActionInProgress(null);
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  const handleRemoveInterface = async (ifaceName: string) => {
    if (!window.confirm(`Stop tracking and remove interface '${ifaceName}' from vnstat database?`)) {
      return;
    }
    setActionInProgress(ifaceName);
    try {
      const msg = await removeInterfaceFromDb(ifaceName);
      setExportNotice(msg);
    } catch (e) {
      setExportNotice(`Error removing interface: ${String(e)}`);
    } finally {
      setActionInProgress(null);
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  const handleCopyJson = () => {
    if (vnstatData) {
      navigator.clipboard.writeText(JSON.stringify(vnstatData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportFile = async (format: 'json' | 'csv') => {
    const path = await saveExport(format);
    setExportNotice(`Export file successfully saved to ${path}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all display and billing settings to default parameters?')) {
      resetConfig();
      setQuotaGbInput('500');
      setCycleDayInput('1');
      setThresholdInput('85');
      setQuotaEnabled(true);
      setExportNotice('Preferences reset to factory defaults');
      setTimeout(() => setExportNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Quota & Billing Cycle Settings */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Monthly Quota & Billing Cycle</h3>
                <HelpTooltip
                  title="Monthly Quota & Billing Cycle"
                  content="Configures ISP monthly traffic budget and billing rollover day. When enabled, Overview displays gauge percentage, consumed bytes, and remaining allowance."
                  formula="Used % = (Current Month Total / Quota Cap) * 100"
                />
              </div>
              <p className="text-xs text-slate-400">
                Configure your ISP data cap threshold and billing renewal day
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={quotaEnabled}
              onChange={(e) => setQuotaEnabled(e.target.checked)}
              className="w-4 h-4 rounded bg-white/5 border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-300">Enable Quota Tracking</span>
          </label>
        </div>

        <form onSubmit={handleSaveBilling} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Data Cap (Gigabytes)
              </label>
              <HelpTooltip
                title="Monthly Allowance"
                content="Maximum transfer allowance in gigabytes. Enter total quota allocated by your internet provider."
                formula="Cap Bytes = GB * 1,000,000,000"
              />
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={quotaGbInput}
                onChange={(e) => setQuotaGbInput(e.target.value)}
                disabled={!quotaEnabled}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors disabled:opacity-50"
                placeholder="500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
                GB
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Current: {formatBytes(billingConfig.monthlyQuotaBytes, unitPreference)}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Billing Rollover Day
              </label>
              <HelpTooltip
                title="Billing Day"
                content="Day of month when ISP resets monthly counter (1st to 31st). Traffic prior to this day in previous billing cycle is excluded."
              />
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="31"
                value={cycleDayInput}
                onChange={(e) => setCycleDayInput(e.target.value)}
                disabled={!quotaEnabled}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors disabled:opacity-50"
                placeholder="1"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
                Day
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Resets every month on day {billingConfig.cycleStartDay}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Warning Threshold (%)
              </label>
              <HelpTooltip
                title="Warning Threshold"
                content="Percentage at which the quota gauge switches to warning amber/red and flags burst alert."
              />
            </div>
            <div className="relative">
              <input
                type="number"
                min="10"
                max="100"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                disabled={!quotaEnabled}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors disabled:opacity-50"
                placeholder="85"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Alerts when consumption exceeds {billingConfig.alertThresholdPercent}%
            </p>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <AppleButton type="submit" variant="primary" size="md">
              Save Billing Parameters
            </AppleButton>
          </div>
        </form>
      </GlassCard>

      {/* Interface Management & Database Controls */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Interface & Database Management</h3>
                <HelpTooltip
                  title="Database Sync & Interface Registration"
                  content="vnstat records network interfaces into SQLite database. Untracked interfaces can be added with vnstat --add. You can also trigger immediate database synchronization via vnstat -u."
                  formula="vnstat -u && vnstat --add -i <iface>"
                />
              </div>
              <p className="text-xs text-slate-400">
                Manage registered interfaces and sync SQLite database counters
              </p>
            </div>
          </div>

          <AppleButton
            variant="glass"
            size="sm"
            onClick={handleSyncDb}
            disabled={isUpdatingDb}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isUpdatingDb ? 'animate-spin text-cyan-400' : ''}`} />}
          >
            {isUpdatingDb ? 'Synchronizing...' : 'Sync Database Now'}
          </AppleButton>
        </div>

        {/* Selected Interface Alias */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">
                Rename Active Interface: <span className="text-cyan-400 font-mono">{selectedInterface}</span>
              </span>
            </div>
            {activeIface?.alias && (
              <span className="text-xs text-slate-400 font-mono">
                Current: <span className="text-white">'{activeIface.alias}'</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAlias} className="flex gap-3">
            <input
              type="text"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500/60 transition-colors"
              placeholder="e.g. Primary Fiber Optic, Office VPN"
            />
            <AppleButton
              type="submit"
              variant="secondary"
              size="sm"
              icon={aliasSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : undefined}
            >
              {aliasSaved ? 'Saved' : 'Save Alias'}
            </AppleButton>
          </form>
        </div>

        {/* Interface Registry Table */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              System Network Interfaces ({interfaces.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Detected via /proc/net/dev</span>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 font-mono text-xs">
            {interfaces.map((iface: InterfaceSummary) => {
              const isSelected = iface.name === selectedInterface;
              const isBusy = actionInProgress === iface.name;

              return (
                <div
                  key={iface.name}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-cyan-500/5' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{iface.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-sans border border-cyan-500/30">
                            Active
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                            iface.is_up
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {iface.is_up ? 'UP' : 'DOWN'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 font-sans">
                        Kernel Counters: RX {formatBytes(iface.rx_bytes, unitPreference)} • TX {formatBytes(iface.tx_bytes, unitPreference)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {iface.in_database ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20 font-sans flex items-center gap-1.5">
                        <Check className="w-3 h-3" /> Tracked in DB
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] border border-amber-500/20 font-sans flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" /> Untracked
                      </span>
                    )}

                    {iface.in_database ? (
                      <AppleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInterface(iface.name)}
                        disabled={isBusy}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        {isBusy ? 'Removing...' : 'Untrack'}
                      </AppleButton>
                    ) : (
                      <AppleButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddInterface(iface.name)}
                        disabled={isBusy}
                        icon={<PlusCircle className="w-3.5 h-3.5 text-cyan-400" />}
                      >
                        {isBusy ? 'Adding...' : 'Track Interface'}
                      </AppleButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Appearance Themes Gallery */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border transition-colors duration-300"
              style={{
                backgroundColor: 'var(--accent-primary-subtle)',
                borderColor: 'var(--accent-primary-border)',
                color: 'var(--accent-primary)',
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                  Appearance & Desktop Themes
                </h3>
                <HelpTooltip
                  title="Calibrated Color Themes"
                  content="Select from 6 desktop appearance themes. Designed for users with different light sensitivities or aesthetic preferences. Graphite Pro provides neutral macOS dark without blue glare; Solar Amber eliminates blue light fatigue; Studio Light provides classic macOS daytime clarity."
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Customize app personality, contrast, and night-shift comfort (6 calibrated themes)
              </p>
            </div>
          </div>

          <span
            className="text-xs font-mono px-2.5 py-1 rounded-full border capitalize self-start sm:self-auto"
            style={{
              backgroundColor: 'var(--accent-primary-subtle)',
              borderColor: 'var(--accent-primary-border)',
              color: 'var(--accent-primary)',
            }}
          >
            Active: {theme.replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {APP_THEMES.map((t) => {
            const isSelected = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setExportNotice(`Switched theme to ${t.name}`);
                  setTimeout(() => setExportNotice(null), 3000);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all apple-press relative flex flex-col justify-between group ${
                  isSelected ? 'shadow-lg' : 'hover:border-white/20'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-input)',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                }}
              >
                <div>
                  {/* Top Bar: Name + Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                      {t.name}
                    </span>
                    <span
                      className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-dim)',
                      }}
                    >
                      {t.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                    {t.description}
                  </p>
                </div>

                {/* Color Palette Swatches Preview */}
                <div
                  className="pt-2.5 border-t flex items-center justify-between"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-sm"
                      style={{ backgroundColor: t.previewColors.bg, borderColor: 'rgba(255,255,255,0.2)' }}
                      title="Background"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-sm"
                      style={{ backgroundColor: t.previewColors.surface, borderColor: 'rgba(255,255,255,0.2)' }}
                      title="Glass Surface"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-sm"
                      style={{ backgroundColor: t.previewColors.accent, borderColor: 'rgba(255,255,255,0.2)' }}
                      title="Primary Accent"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-sm"
                      style={{ backgroundColor: t.previewColors.rx, borderColor: 'rgba(255,255,255,0.2)' }}
                      title="RX Download"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-sm"
                      style={{ backgroundColor: t.previewColors.tx, borderColor: 'rgba(255,255,255,0.2)' }}
                      title="TX Upload"
                    />
                  </div>

                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-lg border transition-colors"
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--accent-primary-fg)',
                            borderColor: 'transparent',
                          }
                        : {
                            backgroundColor: 'transparent',
                            color: 'var(--text-dim)',
                            borderColor: 'var(--border-subtle)',
                          }
                    }
                  >
                    {isSelected ? 'Active' : 'Apply'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Display Unit Preferences */}
      <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Units & Rates Representation</h3>
            <HelpTooltip
              title="Unit Standard Formats"
              content="SI uses decimal powers of 10 (1000 = 1 KB). IEC uses binary powers of 2 (1024 = 1 KiB), standard in computer engineering. Bits multiplies byte quantities by 8 (standard for telecom broadband lines)."
              formula="1 KiB = 1024 B, 1 KB = 1000 B, 1 Mbps = 125,000 B/s"
            />
          </div>
          <p className="text-xs text-slate-400">
            SI (1000 base: KB/MB/GB), IEC (1024 base: KiB/MiB/GiB), or Bits (Kbps/Mbps/Gbps)
          </p>
        </div>

        <SegmentedControl<UnitPreference>
          id="settings-unit-pref"
          options={[
            { value: 'SI', label: 'SI (KB/MB)' },
            { value: 'IEC', label: 'IEC (KiB/MiB)' },
            { value: 'BITS', label: 'Bits (Mbps)' },
          ]}
          value={unitPreference}
          onChange={setUnitPreference}
        />
      </GlassCard>

      {/* Export Center */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Data Export & Diagnostic Center</h3>
              <HelpTooltip
                title="Export Formats"
                content="Exports vnstat SQLite records to ~/Downloads as CSV table or raw JSON dump for external statistical software (R, Pandas, Grafana)."
              />
            </div>
            <p className="text-xs text-slate-400">
              Export historical dataset to ~/Downloads or copy JSON database structure
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5 mt-3">
          <div className="flex flex-wrap gap-2.5">
            <AppleButton
              variant="glass"
              icon={<Download className="w-4 h-4" />}
              onClick={() => handleExportFile('csv')}
            >
              Export CSV Dataset
            </AppleButton>

            <AppleButton
              variant="glass"
              icon={<Layers className="w-4 h-4" />}
              onClick={() => handleExportFile('json')}
            >
              Export Raw JSON Dump
            </AppleButton>

            <AppleButton
              variant="ghost"
              icon={
                copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )
              }
              onClick={handleCopyJson}
            >
              {copied ? 'Copied to Clipboard' : 'Copy JSON'}
            </AppleButton>
          </div>

          <AppleButton
            variant="ghost"
            onClick={handleResetDefaults}
            className="text-slate-400 hover:text-amber-400"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Defaults
          </AppleButton>
        </div>
      </GlassCard>

      {/* System Diagnostics */}
      <GlassCard className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400 shrink-0" />
          <span>vnStat Daemon 2.13 (SQLite 3.53.4) • /var/lib/vnstat/vnstat.db</span>
        </div>
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Native Linux Desktop • Tokio 1s Sampler</span>
        </div>
      </GlassCard>
    </div>
  );
};
