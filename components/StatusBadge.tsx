import { StyleSheet, Text, View } from 'react-native';

import { fonts, statusColors, useAppTheme } from '../theme/tokens';
import type { SiteStatus } from '../types';

type Props = {
  status: SiteStatus;
};

const labels: Record<SiteStatus, string> = {
  safe: 'Safe',
  watch: 'Watch',
  unsafe: 'Unsafe',
};

export function StatusBadge({ status }: Props) {
  const theme = useAppTheme();
  const color = statusColors[status];

  return (
    <View
      accessibilityLabel={`Water status: ${labels[status]}`}
      style={[styles.badge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: theme.text }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
});

