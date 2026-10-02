import type { AlertEvent, Parameter, ParameterKey, Site, SiteStatus } from '../types';

export const PARAMETERS: readonly Parameter[] = [
  { key: 'ph', label: 'pH', shortLabel: 'pH', unit: '', safeRange: [6.5, 8.5] },
  { key: 'tds', label: 'TDS', shortLabel: 'TDS', unit: 'ppm', safeRange: [0, 300] },
  { key: 'turb', label: 'Turbidity', shortLabel: 'Turb', unit: 'NTU', safeRange: [0, 5] },
  { key: 'doo', label: 'Dissolved O₂', shortLabel: 'O₂', unit: 'mg/L', safeRange: [5, 9] },
  { key: 'temp', label: 'Temperature', shortLabel: 'Temp', unit: '°C', safeRange: [15, 28] },
] as const;

type SiteDefinition = {
  id: string;
  name: string;
  building: string;
  status: SiteStatus;
  targets: Record<ParameterKey, readonly [number, number, number]>;
};

// Each tuple is [oldest value, newest value, noise amplitude].
const SITE_DEFINITIONS: readonly SiteDefinition[] = [
  {
    id: 'hostel',
    name: 'Hostel Wing A Cooler',
    building: 'Hostel Block A',
    status: 'watch',
    targets: {
      ph: [7.05, 6.58, 0.08],
      tds: [244, 286, 6],
      turb: [3.15, 4.48, 0.18],
      doo: [6.4, 5.35, 0.14],
      temp: [24.1, 27.2, 0.3],
    },
  },
  {
    id: 'canteen',
    name: 'Canteen Cooler',
    building: 'Central Canteen',
    status: 'safe',
    targets: {
      ph: [7.18, 7.24, 0.07],
      tds: [174, 181, 5],
      turb: [1.3, 1.25, 0.12],
      doo: [7.15, 7.22, 0.12],
      temp: [22.6, 22.9, 0.25],
    },
  },
  {
    id: 'sports',
    name: 'Sports Complex',
    building: 'Sports & Gym Block',
    status: 'unsafe',
    targets: {
      ph: [6.72, 6.18, 0.1],
      tds: [276, 352, 8],
      turb: [4.05, 6.35, 0.25],
      doo: [5.45, 4.42, 0.16],
      temp: [26.1, 29.15, 0.35],
    },
  },
  {
    id: 'admin',
    name: 'Admin Building',
    building: 'Administrative Block · Lobby',
    status: 'safe',
    targets: {
      ph: [7.38, 7.34, 0.06],
      tds: [142, 148, 4],
      turb: [0.82, 0.88, 0.09],
      doo: [7.5, 7.45, 0.1],
      temp: [21.8, 22.1, 0.2],
    },
  },
] as const;

function seededNoise(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function precisionFor(key: ParameterKey): number {
  return key === 'tds' ? 0 : key === 'ph' ? 2 : 1;
}

function generateSeries(
  key: ParameterKey,
  definitionIndex: number,
  target: readonly [number, number, number],
): number[] {
  const [start, end, noise] = target;
  const parameterIndex = PARAMETERS.findIndex((parameter) => parameter.key === key);

  return Array.from({ length: 24 }, (_, index) => {
    const progress = index / 23;
    const drift = start + (end - start) * progress;
    const dailyWave = Math.sin(progress * Math.PI * 2) * noise * 0.45;
    const jitter = seededNoise((definitionIndex + 1) * 100 + parameterIndex * 24 + index) * noise;
    return Number((drift + dailyWave + jitter).toFixed(precisionFor(key)));
  });
}

export const MOCK_HISTORIES: Record<string, Record<ParameterKey, number[]>> =
  Object.fromEntries(
    SITE_DEFINITIONS.map((site, siteIndex) => [
      site.id,
      Object.fromEntries(
        PARAMETERS.map((parameter) => [
          parameter.key,
          generateSeries(parameter.key, siteIndex, site.targets[parameter.key]),
        ]),
      ) as Record<ParameterKey, number[]>,
    ]),
  );

export const MOCK_SITES: Site[] = SITE_DEFINITIONS.map((site) => ({
  id: site.id,
  name: site.name,
  building: site.building,
  status: site.status,
  latest: Object.fromEntries(
    PARAMETERS.map((parameter) => {
      const history = MOCK_HISTORIES[site.id]?.[parameter.key];
      return [parameter.key, history?.[history.length - 1] ?? 0];
    }),
  ) as Record<ParameterKey, number>,
}));

export const MOCK_ALERTS: AlertEvent[] = [
  {
    id: 'alert-1',
    siteName: 'Sports Complex',
    parameter: 'Turbidity',
    value: '6.3 NTU',
    timestamp: 'Today · 10:42 AM',
    severity: 'unsafe',
  },
  {
    id: 'alert-2',
    siteName: 'Sports Complex',
    parameter: 'TDS',
    value: '352 ppm',
    timestamp: 'Today · 9:18 AM',
    severity: 'unsafe',
  },
  {
    id: 'alert-3',
    siteName: 'Hostel Wing A Cooler',
    parameter: 'pH',
    value: '6.58',
    timestamp: 'Yesterday · 8:05 PM',
    severity: 'watch',
  },
  {
    id: 'alert-4',
    siteName: 'Hostel Wing A Cooler',
    parameter: 'Turbidity',
    value: '4.5 NTU',
    timestamp: 'Yesterday · 4:36 PM',
    severity: 'watch',
  },
];

