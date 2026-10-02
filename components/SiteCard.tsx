import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, statusColors, useAppTheme } from '../theme/tokens';
import type { Site } from '../types';
import { Sparkline } from './Sparkline';
import { StatusBadge } from './StatusBadge';

type Props = {
  site: Site;
  tdsHistory: number[];
  chartWidth: number;
  onPress: () => void;
};

export function SiteCard({ site, tdsHistory, chartWidth, onPress }: Props) {
  const theme = useAppTheme();
  const accent = statusColors[site.status];
  const stats = [
    { label: 'pH', value: site.latest.ph.toFixed(2) },
    { label: 'TDS', value: `${Math.round(site.latest.tds)}`, unit: ' ppm' },
    { label: 'Turbidity', value: site.latest.turb.toFixed(1), unit: ' NTU' },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${site.name}, ${site.status} water status`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={[styles.name, { color: theme.text }]}>{site.name}</Text>
          <Text style={[styles.building, { color: theme.muted }]}>{site.building}</Text>
        </View>
        <StatusBadge status={site.status} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.faint }]}>{stat.label}</Text>
            <Text numberOfLines={1} style={[styles.statValue, { color: theme.text }]}>
              {stat.value}
              <Text style={[styles.unit, { color: theme.muted }]}>{stat.unit}</Text>
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.trend, { backgroundColor: theme.sunken }]}>
        <View style={styles.trendHeading}>
          <Text style={[styles.trendLabel, { color: theme.muted }]}>TDS · LAST 24 HOURS</Text>
          <Ionicons name="chevron-forward" color={theme.faint} size={17} />
        </View>
        <Sparkline data={tdsHistory} color={accent} width={chartWidth} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headingCopy: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.bodySemiBold, fontSize: 17, lineHeight: 22 },
  building: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  divider: { height: StyleSheet.hairlineWidth },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  stat: { flex: 1, minWidth: 0, gap: 4 },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, textTransform: 'uppercase' },
  statValue: { fontFamily: fonts.mono, fontSize: 16 },
  unit: { fontFamily: fonts.body, fontSize: 10 },
  trend: { borderRadius: 12, paddingHorizontal: 12, paddingTop: 10, overflow: 'hidden' },
  trendHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trendLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.7 },
});

