import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type {
  BillingConfig,
  InterfaceSummary,
  LiveRateSample,
  NavigationTab,
  PercentileReport,
  UnitPreference,
  VnstatResponse,
  AppTheme,
} from '../types/vnstat';

interface NetworkState {
  interfaces: InterfaceSummary[];
  selectedInterface: string;
  activeTab: NavigationTab;
  vnstatData: VnstatResponse | null;
  percentileReport: PercentileReport | null;
  liveHistory: LiveRateSample[];
  currentLive: LiveRateSample | null;
  peakLiveRx: number;
  peakLiveTx: number;
  unitPreference: UnitPreference;
  theme: AppTheme;
  defaultInterface: string | null;
  billingConfig: BillingConfig;
  isLoading: boolean;
  error: string | null;
  isLiveListening: boolean;

  // Actions
  setSelectedInterface: (iface: string) => void;
  setDefaultInterface: (iface: string | null) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setUnitPreference: (pref: UnitPreference) => void;
  setTheme: (theme: AppTheme) => void;
  setBillingConfig: (config: Partial<BillingConfig>) => void;
  resetConfig: () => void;
  fetchInterfaces: () => Promise<void>;
  fetchVnstatData: () => Promise<void>;
  fetchPercentileReport: () => Promise<void>;
  initLiveMonitor: () => Promise<() => void>;
  saveExport: (format: 'json' | 'csv') => Promise<string>;
  setAlias: (alias: string) => Promise<void>;
  addInterfaceToDb: (iface: string) => Promise<string>;
  removeInterfaceFromDb: (iface: string) => Promise<string>;
  updateDatabase: (iface?: string) => Promise<string>;
}

// Fallback sample data if running in pure browser without Tauri backend
const mockVnstatData: VnstatResponse = {
  vnstatversion: '2.13',
  jsonversion: '2',
  interfaces: [
    {
      name: 'wlan0',
      alias: 'Wi-Fi Primary',
      created: { date: { year: 2026, month: 8, day: 21 }, timestamp: 1787341394 },
      updated: { date: { year: 2026, month: 10, day: 10 }, time: { hour: 13, minute: 20 }, timestamp: 1791634800 },
      traffic: {
        total: { rx: 504829283721, tx: 181294829102 },
        fiveminute: Array.from({ length: 24 }).map((_, i) => ({
          id: i,
          date: { year: 2026, month: 10, day: 10 },
          time: { hour: 11 + Math.floor(i / 12), minute: (i * 5) % 60 },
          timestamp: 1791628000 + i * 300,
          rx: Math.floor(Math.random() * 50000000) + 5000000,
          tx: Math.floor(Math.random() * 20000000) + 1000000,
        })),
        hour: Array.from({ length: 24 }).map((_, i) => ({
          id: i,
          date: { year: 2026, month: 10, day: 10 },
          time: { hour: i, minute: 0 },
          timestamp: 1791586800 + i * 3600,
          rx: Math.floor(Math.random() * 400000000) + 50000000,
          tx: Math.floor(Math.random() * 150000000) + 10000000,
        })),
        day: Array.from({ length: 30 }).map((_, i) => ({
          id: i,
          date: { year: 2026, month: 9 + Math.floor(i / 20), day: (i % 20) + 1 },
          timestamp: 1788217200 + i * 86400,
          rx: Math.floor(Math.random() * 12000000000) + 1000000000,
          tx: Math.floor(Math.random() * 3000000000) + 500000000,
        })),
        month: [
          { id: 1, date: { year: 2026, month: 8 }, timestamp: 1785538800, rx: 291216859536, tx: 105256455417 },
          { id: 2, date: { year: 2026, month: 9 }, timestamp: 1788217200, rx: 147004891754, tx: 52948175075 },
          { id: 3, date: { year: 2026, month: 10 }, timestamp: 1790809200, rx: 66607532431, tx: 23090218610 },
        ],
        year: [
          { id: 1, date: { year: 2026 }, timestamp: 1767222000, rx: 504829283721, tx: 181294829102 },
        ],
        top: Array.from({ length: 15 }).map((_, i) => ({
          id: i,
          date: { year: 2026, month: 8 + (i % 2), day: (i * 2) + 1 },
          timestamp: 1787526000 + i * 86400,
          rx: Math.floor(86000000000 / (1 + i * 0.15)),
          tx: Math.floor(42000000000 / (1 + i * 0.15)),
        })),
      },
    },
  ],
};

const getInitialTheme = (): AppTheme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vnstat_theme') as AppTheme | null;
    if (saved && ['cyber-neon', 'graphite', 'solar', 'emerald', 'nordic', 'light'].includes(saved)) {
      return saved;
    }
  }
  return 'cyber-neon';
};

export const applyThemeToDom = (theme: AppTheme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }
};

const initialTheme = getInitialTheme();
applyThemeToDom(initialTheme);

const getInitialDefaultInterface = (): string | null => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('netpulse_default_interface') || localStorage.getItem('vnstat_default_interface') || null;
  }
  return null;
};
const initialDefaultIface = getInitialDefaultInterface();

export const useNetworkStore = create<NetworkState>((set, get) => ({
  interfaces: [
    { name: 'wlan0', is_up: true, in_database: true, rx_bytes: 12212811191, tx_bytes: 3296136584 },
    { name: 'enp0s31f6', is_up: false, in_database: true, rx_bytes: 0, tx_bytes: 0 },
    { name: 'CloudflareWARP', is_up: true, in_database: true, rx_bytes: 192919151, tx_bytes: 445416507 },
  ],
  selectedInterface: initialDefaultIface || 'wlan0',
  defaultInterface: initialDefaultIface,
  activeTab: 'overview',
  vnstatData: null,
  percentileReport: null,
  liveHistory: [],
  currentLive: null,
  peakLiveRx: 0,
  peakLiveTx: 0,
  unitPreference: 'SI',
  theme: initialTheme,
  billingConfig: {
    monthlyQuotaBytes: 500 * 1000 * 1000 * 1000, // 500 GB default
    cycleStartDay: 1,
    enabled: true,
    alertThresholdPercent: 85,
  },
  isLoading: false,
  error: null,
  isLiveListening: false,

  setSelectedInterface: (iface) => {
    set({ selectedInterface: iface });
    get().fetchVnstatData();
    get().fetchPercentileReport();
  },

  setDefaultInterface: (iface) => {
    if (typeof localStorage !== 'undefined') {
      if (iface) {
        localStorage.setItem('netpulse_default_interface', iface);
      } else {
        localStorage.removeItem('netpulse_default_interface');
      }
    }
    set({ defaultInterface: iface });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setUnitPreference: (pref) => set({ unitPreference: pref }),

  setTheme: (theme) => {
    applyThemeToDom(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('vnstat_theme', theme);
    }
    set({ theme });
  },

  setBillingConfig: (config) =>
    set((state) => ({ billingConfig: { ...state.billingConfig, ...config } })),

  fetchInterfaces: async () => {
    try {
      const result = await invoke<InterfaceSummary[]>('get_interfaces');
      if (result && result.length > 0) {
        set({ interfaces: result });
        const defaultIface = get().defaultInterface;
        const currentSelected = get().selectedInterface;
        if (defaultIface && result.some((i) => i.name === defaultIface)) {
          set({ selectedInterface: defaultIface });
        } else if (!result.some((i) => i.name === currentSelected)) {
          const firstDb = result.find((i) => i.in_database) || result[0];
          set({ selectedInterface: firstDb.name });
        }
      }
    } catch (e) {
      console.warn('Using fallback interfaces (standalone browser mode):', e);
    }
  },

  fetchVnstatData: async () => {
    set({ isLoading: true, error: null });
    try {
      const iface = get().selectedInterface;
      const data = await invoke<VnstatResponse>('get_vnstat_data', { interface: iface });
      set({ vnstatData: data, isLoading: false });
    } catch (e) {
      console.warn('Vnstat invoke error, falling back to cached/mock data:', e);
      set({ vnstatData: mockVnstatData, isLoading: false });
    }
  },

  fetchPercentileReport: async () => {
    try {
      const iface = get().selectedInterface;
      const report = await invoke<PercentileReport>('get_95th_percentile', { interface: iface });
      set({ percentileReport: report });
    } catch (e) {
      console.warn('Percentile invoke error:', e);
    }
  },

  initLiveMonitor: async () => {
    if (get().isLiveListening) {
      return () => {};
    }

    set({ isLiveListening: true });

    try {
      const unlisten = await listen<LiveRateSample[]>('live-traffic-tick', (event) => {
        const selected = get().selectedInterface;
        const sample = event.payload.find((s) => s.interface === selected);

        if (sample) {
          set((state) => {
            const nextHistory = [...state.liveHistory, sample].slice(-60);
            return {
              currentLive: sample,
              liveHistory: nextHistory,
              peakLiveRx: Math.max(state.peakLiveRx, sample.rx_bytes_per_sec),
              peakLiveTx: Math.max(state.peakLiveTx, sample.tx_bytes_per_sec),
            };
          });
        }
      });

      return () => {
        unlisten();
        set({ isLiveListening: false });
      };
    } catch {
      // Browser environment simulated ticks
      const interval = setInterval(() => {
        const now = Date.now();
        const rx = Math.floor(Math.random() * 2500000);
        const tx = Math.floor(Math.random() * 800000);
        const sample: LiveRateSample = {
          interface: get().selectedInterface,
          timestamp_ms: now,
          rx_bytes_per_sec: rx,
          tx_bytes_per_sec: tx,
          rx_packets_per_sec: Math.floor(rx / 1400),
          tx_packets_per_sec: Math.floor(tx / 1400),
          total_rx_bytes: 12212811191 + rx,
          total_tx_bytes: 3296136584 + tx,
        };

        set((state) => ({
          currentLive: sample,
          liveHistory: [...state.liveHistory, sample].slice(-60),
          peakLiveRx: Math.max(state.peakLiveRx, rx),
          peakLiveTx: Math.max(state.peakLiveTx, tx),
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  },

  saveExport: async (format) => {
    const data = get().vnstatData;
    const iface = get().selectedInterface;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `vnstat_${iface}_${dateStr}.${format}`;

    let contents = '';
    if (format === 'json') {
      contents = JSON.stringify(data, null, 2);
    } else {
      // CSV format
      const activeIface = data?.interfaces.find((i) => i.name === iface) || data?.interfaces[0];
      const rows = ['Period,Timestamp,Date,Time,RX_Bytes,TX_Bytes,Total_Bytes'];
      activeIface?.traffic.day?.forEach((d) => {
        rows.push(
          `Day,${d.timestamp},${d.date.year}-${d.date.month}-${d.date.day},,${d.rx},${d.tx},${d.rx + d.tx}`
        );
      });
      activeIface?.traffic.hour?.forEach((h) => {
        rows.push(
          `Hour,${h.timestamp},${h.date.year}-${h.date.month}-${h.date.day},${h.time?.hour}:00,${h.rx},${h.tx},${h.rx + h.tx}`
        );
      });
      contents = rows.join('\n');
    }

    try {
      const path = await invoke<string>('save_export_file', { filename, contents });
      return path;
    } catch {
      // Fallback in browser
      const blob = new Blob([contents], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return filename;
    }
  },

  setAlias: async (alias) => {
    const iface = get().selectedInterface;
    try {
      await invoke('set_interface_alias', { interface: iface, alias });
      await get().fetchVnstatData();
    } catch (e) {
      console.error('Failed to set alias:', e);
      throw e;
    }
  },

  resetConfig: () => {
    applyThemeToDom('cyber-neon');
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('vnstat_theme', 'cyber-neon');
    }
    set({
      unitPreference: 'SI',
      theme: 'cyber-neon',
      billingConfig: {
        monthlyQuotaBytes: 500 * 1000 * 1000 * 1000,
        cycleStartDay: 1,
        enabled: true,
        alertThresholdPercent: 85,
      },
    });
  },

  addInterfaceToDb: async (iface) => {
    try {
      const msg = await invoke<string>('add_interface_to_db', { interface: iface });
      await get().fetchInterfaces();
      await get().fetchVnstatData();
      return msg;
    } catch (e) {
      console.error('Failed to add interface:', e);
      throw e;
    }
  },

  removeInterfaceFromDb: async (iface) => {
    try {
      const msg = await invoke<string>('remove_interface_from_db', { interface: iface });
      await get().fetchInterfaces();
      await get().fetchVnstatData();
      return msg;
    } catch (e) {
      console.error('Failed to remove interface:', e);
      throw e;
    }
  },

  updateDatabase: async (iface) => {
    try {
      const msg = await invoke<string>('update_database', { interface: iface || null });
      await get().fetchInterfaces();
      await get().fetchVnstatData();
      return msg;
    } catch (e) {
      console.error('Failed to update database:', e);
      throw e;
    }
  },
}));
