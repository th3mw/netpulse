import { DateObj, TimeObj, UnitPreference } from '../types/vnstat';

export function formatBytes(
  bytes: number,
  pref: UnitPreference = 'SI',
  decimals: number = 2
): string {
  if (isNaN(bytes) || bytes === 0) {
    return pref === 'BITS' ? '0 bit' : '0 B';
  }

  if (pref === 'BITS') {
    const bits = bytes * 8;
    const units = ['bit', 'kbit', 'Mbit', 'Gbit', 'Tbit', 'Pbit'];
    const k = 1000;
    const i = Math.floor(Math.log(bits) / Math.log(k));
    const idx = Math.min(i, units.length - 1);
    const val = (bits / Math.pow(k, idx)).toFixed(decimals);
    return `${val} ${units[idx]}`;
  }

  if (pref === 'IEC') {
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const idx = Math.min(i, units.length - 1);
    const val = (bytes / Math.pow(k, idx)).toFixed(decimals);
    return `${val} ${units[idx]}`;
  }

  // SI default (1000 base)
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1000;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, units.length - 1);
  const val = (bytes / Math.pow(k, idx)).toFixed(decimals);
  return `${val} ${units[idx]}`;
}

export function formatRate(bytesPerSec: number, pref: UnitPreference = 'SI'): string {
  if (isNaN(bytesPerSec) || bytesPerSec === 0) {
    return pref === 'BITS' ? '0 bit/s' : '0 B/s';
  }

  if (pref === 'BITS') {
    const bitsPerSec = bytesPerSec * 8;
    const units = ['bit/s', 'kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s'];
    const k = 1000;
    const i = Math.floor(Math.log(bitsPerSec) / Math.log(k));
    const idx = Math.min(Math.max(i, 0), units.length - 1);
    const val = (bitsPerSec / Math.pow(k, idx)).toFixed(1);
    return `${val} ${units[idx]}`;
  }

  const base = formatBytes(bytesPerSec, pref, 1);
  return `${base}/s`;
}

export function formatPackets(pps: number): string {
  if (pps >= 1000000) {
    return `${(pps / 1000000).toFixed(1)} Mpps`;
  }
  if (pps >= 1000) {
    return `${(pps / 1000).toFixed(1)} kpps`;
  }
  return `${pps} pps`;
}

export function formatDate(d?: DateObj): string {
  if (!d) return '-';
  const y = d.year;
  const m = d.month !== undefined ? String(d.month).padStart(2, '0') : '';
  const day = d.day !== undefined ? String(d.day).padStart(2, '0') : '';

  if (m && day) return `${y}-${m}-${day}`;
  if (m) return `${y}-${m}`;
  return `${y}`;
}

export function formatTime(t?: TimeObj): string {
  if (!t) return '';
  const h = String(t.hour).padStart(2, '0');
  const m = String(t.minute).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDateTime(d?: DateObj, t?: TimeObj): string {
  const dateStr = formatDate(d);
  const timeStr = formatTime(t);
  return timeStr ? `${dateStr} ${timeStr}` : dateStr;
}
