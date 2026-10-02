import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MOCK_ALERTS } from '../services/mockData';
import { fonts, statusColors, useAppTheme } from '../theme/tokens';

export function AlertsScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 700 ? 32 : 20;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: horizontalPadding, width: '100%', maxWidth: 784 },
        ]}
      >
        <View style={styles.heading}>
          <Text style={[styles.eyebrow, { color: theme.brand }]}>WATER QUALITY EVENTS</Text>
          <Text style={[styles.title, { color: theme.text }]}>Alerts</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Recent readings that crossed a safety limit or need closer monitoring.
          </Text>
        </View>

        <View style={[styles.notice, { backgroundColor: theme.sunken }]}>
          <Ionicons name="information-circle-outline" color={theme.brand} size={19} />
          <Text style={[styles.noticeText, { color: theme.muted }]}>
            Alerts are displayed for review. Acknowledgement workflows will be added later.
          </Text>
        </View>

        <View style={styles.list}>
          {MOCK_ALERTS.map((alert) => {
            const color = statusColors[alert.severity];
            return (
              <View
                key={alert.id}
                style={[
                  styles.alert,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderLeftColor: color,
                    shadowColor: theme.shadow,
                  },
                ]}
              >
                <View style={styles.alertHeading}>
                  <View style={styles.alertCopy}>
                    <Text style={[styles.siteName, { color: theme.text }]}>{alert.siteName}</Text>
                    <Text style={[styles.timestamp, { color: theme.faint }]}>{alert.timestamp}</Text>
                  </View>
                  <View style={[styles.severityIcon, { backgroundColor: `${color}18` }]}>
                    <Ionicons
                      name={alert.severity === 'unsafe' ? 'warning-outline' : 'eye-outline'}
                      color={color}
                      size={18}
                    />
                  </View>
                </View>
                <View style={[styles.reading, { borderTopColor: theme.border }]}>
                  <Text style={[styles.parameter, { color: theme.muted }]}>{alert.parameter}</Text>
                  <Text style={[styles.value, { color }]}>{alert.value}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: 'center', paddingTop: 24, paddingBottom: 36 },
  heading: { gap: 7, marginBottom: 20 },
  eyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1.4 },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 41 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, maxWidth: 540 },
  notice: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 13, marginBottom: 20 },
  noticeText: { flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  list: { gap: 12 },
  alert: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  alertHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  alertCopy: { flex: 1, gap: 3 },
  siteName: { fontFamily: fonts.bodySemiBold, fontSize: 16 },
  timestamp: { fontFamily: fonts.body, fontSize: 11 },
  severityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
    paddingTop: 12,
  },
  parameter: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  value: { fontFamily: fonts.mono, fontSize: 16 },
});

