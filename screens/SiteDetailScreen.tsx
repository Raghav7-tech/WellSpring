import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParameterChart } from '../components/ParameterChart';
import { StatusBadge } from '../components/StatusBadge';
import { getSiteHistory, getSites } from '../services/dataSource';
import { PARAMETERS } from '../services/mockData';
import { fonts, useAppTheme } from '../theme/tokens';
import type { ParameterKey, RootStackParamList, Site } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteDetail'>;

const SAMPLE_ROWS = [
  { index: 23, label: 'Now' },
  { index: 19, label: '4h ago' },
  { index: 15, label: '8h ago' },
  { index: 11, label: '12h ago' },
  { index: 7, label: '16h ago' },
  { index: 3, label: '20h ago' },
] as const;

function formatValue(key: ParameterKey, value: number) {
  if (key === 'tds') return Math.round(value).toString();
  if (key === 'ph') return value.toFixed(2);
  return value.toFixed(1);
}

export function SiteDetailScreen({ route }: Props) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const [site, setSite] = useState<Site | null>(null);
  const [selected, setSelected] = useState<ParameterKey>('ph');
  const [histories, setHistories] = useState<Partial<Record<ParameterKey, number[]>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pagePadding = width >= 700 ? 32 : 20;
  const cardWidth = Math.min(width - pagePadding * 2, 720);
  const chartWidth = Math.max(cardWidth - 36, 250);

  useEffect(() => {
    async function load() {
      try {
        const [sites, historyEntries] = await Promise.all([
          getSites(),
          Promise.all(
            PARAMETERS.map(
              async (parameter) =>
                [parameter.key, await getSiteHistory(route.params.siteId, parameter.key)] as const,
            ),
          ),
        ]);
        setSite(sites.find((candidate) => candidate.id === route.params.siteId) ?? null);
        setHistories(Object.fromEntries(historyEntries));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Site data could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [route.params.siteId]);

  const parameter = useMemo(
    () => PARAMETERS.find((candidate) => candidate.key === selected) ?? PARAMETERS[0],
    [selected],
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.brand} size="large" />
      </View>
    );
  }

  if (error || !site || !parameter) {
    return (
      <View style={[styles.centered, styles.errorWrap, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>{error ?? 'Site not found.'}</Text>
      </View>
    );
  }

  const selectedHistory = histories[selected] ?? [];
  const current = selectedHistory[selectedHistory.length - 1] ?? 0;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: pagePadding, width: '100%', maxWidth: 784 },
        ]}
      >
        <View style={styles.siteHeading}>
          <View style={styles.siteCopy}>
            <Text style={[styles.title, { color: theme.text }]}>{site.name}</Text>
            <Text style={[styles.building, { color: theme.muted }]}>{site.building}</Text>
          </View>
          <StatusBadge status={site.status} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.parameterTabs}
        >
          {PARAMETERS.map((item) => {
            const active = item.key === selected;
            return (
              <TouchableOpacity
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={item.key}
                onPress={() => setSelected(item.key)}
                style={[
                  styles.parameterTab,
                  {
                    backgroundColor: active ? theme.brand : theme.sunken,
                    borderColor: active ? theme.brand : theme.border,
                  },
                ]}
              >
                <Text style={[styles.parameterTabText, { color: active ? '#FFFFFF' : theme.muted }]}>
                  {item.shortLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.chartHeading}>
            <View>
              <Text style={[styles.chartEyebrow, { color: theme.muted }]}>{parameter.label}</Text>
              <Text style={[styles.currentValue, { color: theme.text }]}>
                {formatValue(parameter.key, current)}
                <Text style={[styles.currentUnit, { color: theme.muted }]}> {parameter.unit}</Text>
              </Text>
            </View>
            <View style={styles.rangeCopy}>
              <Text style={[styles.rangeLabel, { color: theme.faint }]}>SAFE RANGE</Text>
              <Text style={[styles.rangeValue, { color: theme.muted }]}>
                {parameter.safeRange[0]}–{parameter.safeRange[1]} {parameter.unit}
              </Text>
            </View>
          </View>
          <ParameterChart
            data={selectedHistory}
            parameter={parameter}
            status={site.status}
            width={chartWidth}
          />
        </View>

        <View style={styles.readingsHeading}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent readings</Text>
          <Text style={[styles.sectionNote, { color: theme.faint }]}>6 samples · 4-hour intervals</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.table, { borderColor: theme.border, backgroundColor: theme.surface }]}
        >
          <View>
            <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: theme.sunken }]}>
              <Text style={[styles.timeCell, styles.headerCell, { color: theme.muted }]}>TIME</Text>
              {PARAMETERS.map((item) => (
                <Text key={item.key} style={[styles.valueCell, styles.headerCell, { color: theme.muted }]}>
                  {item.shortLabel}
                </Text>
              ))}
            </View>
            {SAMPLE_ROWS.map((row, rowIndex) => (
              <View
                key={row.label}
                style={[
                  styles.tableRow,
                  rowIndex < SAMPLE_ROWS.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.timeCell, { color: theme.muted }]}>{row.label}</Text>
                {PARAMETERS.map((item) => (
                  <Text key={item.key} style={[styles.valueCell, { color: theme.text }]}>
                    {formatValue(item.key, histories[item.key]?.[row.index] ?? 0)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorWrap: { padding: 24 },
  errorText: { fontFamily: fonts.body, fontSize: 15, textAlign: 'center' },
  content: { alignSelf: 'center', paddingTop: 14, paddingBottom: 40 },
  siteHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 22 },
  siteCopy: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.display, fontSize: 29, lineHeight: 35 },
  building: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  parameterTabs: { gap: 8, paddingBottom: 18 },
  parameterTab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  parameterTabText: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  chartCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingTop: 18,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  chartHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chartEyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, textTransform: 'uppercase' },
  currentValue: { fontFamily: fonts.mono, fontSize: 27, marginTop: 3 },
  currentUnit: { fontFamily: fonts.body, fontSize: 13 },
  rangeCopy: { alignItems: 'flex-end', gap: 3 },
  rangeLabel: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 0.8 },
  rangeValue: { fontFamily: fonts.mono, fontSize: 11 },
  readingsHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 18 },
  sectionNote: { fontFamily: fonts.body, fontSize: 11 },
  table: { borderWidth: 1, borderRadius: 14 },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 47, paddingHorizontal: 6 },
  tableHeader: { minHeight: 40 },
  headerCell: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5 },
  timeCell: { width: 76, paddingHorizontal: 10, fontFamily: fonts.bodyMedium, fontSize: 11 },
  valueCell: { width: 68, textAlign: 'right', paddingHorizontal: 9, fontFamily: fonts.mono, fontSize: 12 },
});
