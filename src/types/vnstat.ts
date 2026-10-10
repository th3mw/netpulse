export type UnitPreference = 'SI' | 'IEC' | 'BITS';

export type NavigationTab =
  | 'overview'
  | 'live'
  | 'fiveminute'
  | 'hourly'
  | 'daily'
  | 'monthly'
  | 'yearly'
  | 'top'
  | 'heatmap'
  | 'compare'
  | 'settings'
  | 'help';


export interface DateObj {
  year: number;
  month?: number;
  day?: number;
}

export interface TimeObj {
  hour: number;
  minute: number;
}

export interface IntervalEntry {
  id: number;
  date: DateObj;
  time?: TimeObj;
  timestamp: number;
  rx: number;
  tx: number;
}

export interface TrafficContainer {
  total: {
    rx: number;
    tx: number;
  };
  fiveminute?: IntervalEntry[];
  hour?: IntervalEntry[];
  day?: IntervalEntry[];
  month?: IntervalEntry[];
  year?: IntervalEntry[];
  top?: IntervalEntry[];
}

export interface VnstatInterface {
  name: string;
  alias: string;
  created: {
    date: DateObj;
    timestamp: number;
  };
  updated: {
    date: DateObj;
    time?: TimeObj;
    timestamp: number;
  };
  traffic: TrafficContainer;
}

export interface VnstatResponse {
  vnstatversion: string;
  jsonversion: string;
  interfaces: VnstatInterface[];
}

export interface InterfaceSummary {
  name: string;
  is_up: boolean;
  in_database: boolean;
  rx_bytes: number;
  tx_bytes: number;
}

export interface LiveRateSample {
  interface: string;
  timestamp_ms: number;
  rx_bytes_per_sec: number;
  tx_bytes_per_sec: number;
  rx_packets_per_sec: number;
  tx_packets_per_sec: number;
  total_rx_bytes: number;
  total_tx_bytes: number;
}

export interface PercentileReport {
  interface: string;
  period_info: string;
  rx_min_str: string;
  rx_avg_str: string;
  rx_max_str: string;
  rx_95th_str: string;
  tx_min_str: string;
  tx_avg_str: string;
  tx_max_str: string;
  tx_95th_str: string;
  total_min_str: string;
  total_avg_str: string;
  total_max_str: string;
  total_95th_str: string;
}

export interface BillingConfig {
  monthlyQuotaBytes: number;
  cycleStartDay: number;
  enabled: boolean;
  alertThresholdPercent: number;
}
