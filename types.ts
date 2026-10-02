export type SiteStatus = 'safe' | 'watch' | 'unsafe';

export type ParameterKey = 'ph' | 'tds' | 'turb' | 'doo' | 'temp';

export interface Parameter {
  key: ParameterKey;
  label: string;
  shortLabel: string;
  unit: string;
  safeRange: readonly [number, number];
}

export interface Site {
  id: string;
  name: string;
  building: string;
  status: SiteStatus;
  latest: Record<ParameterKey, number>;
}

export interface AlertEvent {
  id: string;
  siteName: string;
  parameter: string;
  value: string;
  timestamp: string;
  severity: Exclude<SiteStatus, 'safe'>;
}

export type RootStackParamList = {
  MainTabs: undefined;
  SiteDetail: { siteId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Assistant: undefined;
  Alerts: undefined;
};

