import React from 'react';
import {
  HardDrive,
  Download,
  Copy,
  Check,
  Tag,
  Database,
  Layers,
} from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { GlassCard } from '../components/ui/GlassCard';
import { AppleButton } from '../components/ui/AppleButton';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import type { UnitPreference, VnstatInterface } from '../types/vnstat';
import { formatBytes } from '../lib/formatters';


export const SettingsView: React.FC = () => {
  const {
    billingConfig,
    setBillingConfig,
    unitPreference,
    setUnitPreference,
    selectedInterface,
    vnstatData,
    setAlias,
    saveExport,
  } = useNetworkStore();

  const activeIface = vnstatData?.interfaces.find((i: VnstatInterface) => i.name === selectedInterface);

  const [quotaGbInput, setQuotaGbInput] = React.useState(
    (billingConfig.monthlyQuotaBytes / (1000 * 1000 * 1000)).toString()
  );
  const [cycleDayInput, setCycleDayInput] = React.useState(
    billingConfig.cycleStartDay.toString()
  );
  const [aliasInput, setAliasInput] = React.useState(activeIface?.alias || '');
  const [aliasSaved, setAliasSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [exportNotice, setExportNotice] = React.useState<string | null>(null);

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    const gb = parseFloat(quotaGbInput) || 500;
    const day = parseInt(cycleDayInput) || 1;
    setBillingConfig({
      monthlyQuotaBytes: gb * 1000 * 1000 * 1000,
      cycleStartDay: Math.max(1, Math.min(31, day)),
      enabled: true,
    });
    setExportNotice('Quota settings updated');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleSaveAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setAlias(aliasInput);
      setAliasSaved(true);
      setTimeout(() => setAliasSaved(false), 2500);
    } catch (e) {
      console.error(e);
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
    setExportNotice(`Export saved to ${path}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          {exportNotice}
        </div>
      )}

      {/* Quota & Billing Cycle Settings */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Monthly Quota & Billing Cycle</h3>
            <p className="text-xs text-slate-400">
              Configure your ISP data cap threshold and billing renewal day
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBilling} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Monthly Data Cap (Gigabytes)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={quotaGbInput}
                onChange={(e) => setQuotaGbInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
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
            <label className="text-xs font-semibold text-slate-300">
              Billing Cycle Start Day (1 - 31)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="31"
                value={cycleDayInput}
                onChange={(e) => setCycleDayInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
                placeholder="1"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
                Day of month
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Resets every month on day {billingConfig.cycleStartDay}
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <AppleButton type="submit" variant="primary" size="md">
              Save Billing Parameters
            </AppleButton>
          </div>
        </form>
      </GlassCard>

      {/* Interface Alias Manager */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Interface Alias</h3>
            <p className="text-xs text-slate-400">
              Set human-readable label in vnstat database for {selectedInterface}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAlias} className="flex gap-3">
          <input
            type="text"
            value={aliasInput}
            onChange={(e) => setAliasInput(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/60 transition-colors"
            placeholder="e.g. Home Fiber Gigabit"
          />
          <AppleButton
            type="submit"
            variant="secondary"
            size="md"
            icon={aliasSaved ? <Check className="w-4 h-4 text-emerald-400" /> : undefined}
          >
            {aliasSaved ? 'Alias Saved' : 'Update Alias'}
          </AppleButton>
        </form>
      </GlassCard>

      {/* Display Unit Preferences */}
      <GlassCard className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">Units & Rates Representation</h3>
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
            <h3 className="text-sm font-semibold text-white">Data Export Center</h3>
            <p className="text-xs text-slate-400">
              Export historical dataset to file or copy JSON database structure
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
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
            {copied ? 'Copied to Clipboard' : 'Copy JSON to Clipboard'}
          </AppleButton>
        </div>
      </GlassCard>

      {/* System Diagnostics */}
      <GlassCard className="p-5 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          <span>vnStat Daemon 2.13 (SQLite 3.53.4) • /var/lib/vnstat/vnstat.db</span>
        </div>
        <span>Native Wayland Desktop App</span>
      </GlassCard>
    </div>
  );
};
