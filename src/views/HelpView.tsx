import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  Gauge,
  Calendar,
  Radio,
  Clock,
  HardDrive,
  Grid,
  Scale,
  Terminal,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AppleButton } from '../components/ui/AppleButton';

interface HelpSection {
  id: string;
  category: 'basics' | 'metrics' | 'units' | 'cli';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  details: React.ReactNode;
  formula?: string;
  cliCommand?: string;
}

const helpItems: HelpSection[] = [
  {
    id: 'rx-tx',
    category: 'basics',
    title: 'RX (Receive / Download) vs TX (Transmit / Upload)',
    icon: Radio,
    summary: 'The fundamental direction of network packet flow tracked by the Linux kernel.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          <strong className="text-emerald-400">RX (Receive)</strong> represents all incoming data
          downloaded to your computer from external networks, the internet, or local LAN devices.
        </p>
        <p>
          <strong className="text-purple-400">TX (Transmit)</strong> represents all outgoing data
          uploaded from your computer (e.g. cloud backups, outgoing requests, video streaming upload).
        </p>
        <p>
          vnStat queries these counters directly from the kernel (<code className="text-cyan-300">/proc/net/dev</code>),
          meaning it does <strong>not</strong> sniff packet contents or consume CPU for deep inspection.
        </p>
      </div>
    ),
    formula: 'Total Traffic = RX_Bytes + TX_Bytes',
  },
  {
    id: 'live-stream',
    category: 'metrics',
    title: 'Live Bandwidth Cockpit & 60-Second Rolling Window',
    icon: Radio,
    summary: 'High-frequency 1000ms real-time throughput gauges and area streaming graph.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          The Live Cockpit polls Linux kernel interface byte counters every 1,000 milliseconds via an
          asynchronous Tokio worker in the Rust backend.
        </p>
        <p>
          Rate calculation divides the byte delta between ticks by the elapsed timestamp, providing
          zero-jitter real-time speeds down to single bytes per second and packets per second (PPS).
        </p>
        <p>
          Hover anywhere on the 60-second rolling graph to scrub and inspect transfer rates at that
          exact second.
        </p>
      </div>
    ),
    formula: 'Rate = (Bytes_Current - Bytes_Previous) / Elapsed_Seconds',
  },
  {
    id: 'percentile',
    category: 'metrics',
    title: '95th Percentile Bursting Explained',
    icon: Gauge,
    summary: 'Burstable rate billing calculation used by Internet transit providers and data centers.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          Standard 95th percentile billing allows a network connection to occasionally burst above its
          nominal commitment rate without incurring financial penalties.
        </p>
        <p>
          During a billing period, periodic bandwidth samples (usually 5-minute slots) are collected,
          sorted in ascending order, and the highest <strong>5% of peak spikes are completely discarded</strong>.
        </p>
        <p>
          The 95th percentile value is the highest rate among the remaining 95% samples. If your peak
          was 50 Mbps but only lasted 2 hours in a month, you are only billed at your 95th rate (~6 Mbps).
        </p>
      </div>
    ),
    formula: 'Sample[ceil(0.95 * Total_Samples)] (Sorted Ascending)',
    cliCommand: 'vnstat --95th -i <interface>',
  },
  {
    id: 'quota-burn',
    category: 'metrics',
    title: 'Monthly Quota & Burn Rate Forecasting',
    icon: HardDrive,
    summary: 'Predicts your month-end volume and suggests safe daily bandwidth allowances.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          The forecast engine calculates your average consumption per day elapsed in your billing cycle,
          then multiplies by the remaining days to predict your month-end total.
        </p>
        <p>
          <strong>Recommended Daily Allowance:</strong> Divides your remaining data budget by the days
          left until your cycle reset date. If you stay under this number each day, you will never
          exceed your monthly cap.
        </p>
      </div>
    ),
    formula: 'Forecast = MTD_Bytes + ((MTD_Bytes / Days_Elapsed) * Days_Remaining)',
  },
  {
    id: 'five-minute',
    category: 'metrics',
    title: '5-Minute Granular Interval Slots',
    icon: Clock,
    summary: 'High-resolution 300-second historical entries recorded by the vnStat daemon.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          vnStat maintains a rotating buffer of 5-minute slots in SQLite (typically 48 hours or more).
        </p>
        <p>
          This view lets you detect micro-bursts, temporary spikes, or anomalous background downloads
          that occurred within specific 5-minute windows.
        </p>
      </div>
    ),
    cliCommand: 'vnstat -5 -i <interface>',
  },
  {
    id: 'hourly-daily',
    category: 'metrics',
    title: 'Hourly & Daily History Profiles',
    icon: Calendar,
    summary: '24-hour distribution profile and long-term day-by-day logs.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          <strong>Hourly View:</strong> Visualizes consumption across the 24 hours of the day,
          automatically tagging the peak throughput hour and quietest hours.
        </p>
        <p>
          <strong>Daily View:</strong> Lists every day with weekday vs weekend aggregate averages,
          revealing whether your bandwidth is predominantly used during business days or weekends.
        </p>
      </div>
    ),
    cliCommand: 'vnstat -h && vnstat -d',
  },
  {
    id: 'heatmap',
    category: 'metrics',
    title: '7×24 Matrix Activity Heatmap',
    icon: Grid,
    summary: 'Recurring density matrix profiling network usage by day of week and hour of day.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          Organizes all recorded hourly data into a 7-row (Sunday - Saturday) by 24-column (0h - 23h)
          grid inspired by the GitHub contributions graph.
        </p>
        <p>
          Cell brightness reflects volume relative to the maximum observed burst. Hovering any square
          reveals exact transferred gigabytes and percentage intensity.
        </p>
      </div>
    ),
  },
  {
    id: 'units',
    category: 'units',
    title: 'Unit Systems: SI vs IEC vs Bits',
    icon: Scale,
    summary: 'The differences between 1000-base, 1024-base, and bit-based rate representations.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>
          <strong className="text-white">SI (Decimal / Base 1000):</strong> Standard defined by the
          International System of Units. 1 KB = 1,000 Bytes, 1 MB = 1,000,000 Bytes, 1 GB = 10⁹ Bytes.
          Used by Apple macOS, drive manufacturers, and telecommunications standards.
        </p>
        <p>
          <strong className="text-white">IEC (Binary / Base 1024):</strong> Standard defined by the
          International Electrotechnical Commission. 1 KiB = 1,024 Bytes, 1 MiB = 1,048,576 Bytes, 1 GiB = 2³⁰ Bytes.
          Traditional Linux/UNIX reporting.
        </p>
        <p>
          <strong className="text-white">Bits (Base 1000, x8 multiplier):</strong> Network transmission
          standard. 1 Byte = 8 bits. Used by Internet Service Providers (e.g. &quot;100 Mbps connection&quot;
          downloads at ~12.5 MB/s).
        </p>
      </div>
    ),
  },
  {
    id: 'cli-cheatsheet',
    category: 'cli',
    title: 'vnStat Linux Daemon Commands & Cheatsheet',
    icon: Terminal,
    summary: 'Essential terminal commands for managing the underlying vnstat service and database.',
    details: (
      <div className="space-y-2 text-xs text-slate-300">
        <p>vnStat runs as a systemd background service writing to SQLite at <code className="text-cyan-300">/var/lib/vnstat/vnstat.db</code>.</p>
        <ul className="list-disc pl-4 space-y-1 text-slate-400">
          <li><code className="text-white">systemctl status vnstat</code> - Check daemon state</li>
          <li><code className="text-white">vnstat --iflist</code> - List available kernel interfaces</li>
          <li><code className="text-white">vnstat --add -i eth0</code> - Track a new interface in DB</li>
          <li><code className="text-white">vnstat --remove -i eth0</code> - Stop tracking an interface</li>
          <li><code className="text-white">vnstat --setalias &quot;Fiber&quot; -i wlan0</code> - Rename interface alias</li>
          <li><code className="text-white">vnstat --json</code> - Dump full telemetry structure as JSON</li>
        </ul>
      </div>
    ),
    cliCommand: 'systemctl status vnstat',
  },
];

export const HelpView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredItems = helpItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <GlassCard className="p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              VNstat Knowledge & Documentation Guide
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive reference for network metrics, formulas, unit systems, and daemon controls
            </p>
          </div>
        </div>

        <a
          href="https://linux.die.net/man/1/vnstat"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors apple-press"
        >
          <span>vnstat(1) Manpage</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </GlassCard>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/8 backdrop-blur-md">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'basics', label: 'Basics' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'units', label: 'Unit Systems' },
            { id: 'cli', label: 'CLI & Cheatsheet' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors apple-press font-medium ${
                selectedCategory === cat.id
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documentation..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Help Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">{item.title}</h4>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>

                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                  {item.details}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                {item.formula && (
                  <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/15 text-[11px] font-mono text-cyan-300 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase select-none">Formula</span>
                    <span className="truncate">{item.formula}</span>
                  </div>
                )}

                {item.cliCommand && (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-slate-200 flex items-center justify-between">
                    <code className="text-cyan-300">{item.cliCommand}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.cliCommand!)}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors apple-press"
                      title="Copy command"
                    >
                      {copiedCmd === item.cliCommand ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
