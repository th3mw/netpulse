import type { ThemeMeta, AppTheme } from '../types/vnstat';

export const APP_THEMES: ThemeMeta[] = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    description: 'Electric cyan and violet glow on deep midnight navy',
    category: 'dark',
    previewColors: {
      bg: '#090d16',
      surface: '#0f172a',
      accent: '#06b6d4',
      rx: '#10b981',
      tx: '#a855f7',
    },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Neutral obsidian dark charcoal with balanced high-contrast accents',
    category: 'dark',
    previewColors: {
      bg: '#121214',
      surface: '#1e1e22',
      accent: '#0a84ff',
      rx: '#34c759',
      tx: '#ff9f0a',
    },
  },
  {
    id: 'solar',
    name: 'Solar Amber',
    description: 'Warm night-shift espresso with amber, copper and zero blue light',
    category: 'dark',
    previewColors: {
      bg: '#14110e',
      surface: '#261e18',
      accent: '#f59e0b',
      rx: '#eab308',
      tx: '#ea580c',
    },
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    description: 'Terminal console evergreen obsidian with jade and mint telemetry',
    category: 'dark',
    previewColors: {
      bg: '#09120c',
      surface: '#102016',
      accent: '#10b981',
      rx: '#22c55e',
      tx: '#14b8a6',
    },
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    description: 'Crisp Scandinavian steel slate with muted arctic tones',
    category: 'dark',
    previewColors: {
      bg: '#0f172a',
      surface: '#1e293b',
      accent: '#0ea5e9',
      rx: '#06b6d4',
      tx: '#6366f1',
    },
  },
  {
    id: 'light',
    name: 'Studio Light',
    description: 'Clean daytime desktop with platinum surfaces and crisp dark typography',
    category: 'light',
    previewColors: {
      bg: '#f4f4f7',
      surface: '#ffffff',
      accent: '#0071e3',
      rx: '#15803d',
      tx: '#7c3aed',
    },
  },
];

export const getThemeById = (id: AppTheme): ThemeMeta => {
  return APP_THEMES.find((t) => t.id === id) || APP_THEMES[0];
};
