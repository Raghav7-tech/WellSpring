import { useColorScheme } from 'react-native';

export const fonts = {
  display: 'Fraunces_600SemiBold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemiBold: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
} as const;

export const statusColors = {
  safe: '#3FA796',
  watch: '#C98A3B',
  unsafe: '#BD4B3C',
} as const;

const light = {
  isDark: false,
  background: '#F4F8F6',
  surface: '#FFFFFF',
  sunken: '#EAF1EE',
  text: '#0B2426',
  muted: '#4A6560',
  faint: '#7C948F',
  brand: '#0E7C74',
  brandStrong: '#0B2426',
  border: 'rgba(11,36,38,0.12)',
  shadow: '#0B2426',
} as const;

const dark = {
  isDark: true,
  background: '#0B2224',
  surface: '#122E31',
  sunken: '#0A1D1F',
  text: '#EAF3F1',
  muted: '#9FBAB5',
  faint: '#5F8580',
  brand: '#4FC0AE',
  brandStrong: '#EAF3F1',
  border: 'rgba(244,248,246,0.14)',
  shadow: '#000000',
} as const;

export type AppTheme = typeof light | typeof dark;

export function useAppTheme(): AppTheme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

