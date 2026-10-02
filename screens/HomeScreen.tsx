import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SiteCard } from '../components/SiteCard';
import { getSiteHistory, getSites } from '../services/dataSource';
import { fonts, useAppTheme } from '../theme/tokens';
import type { RootStackParamList, Site } from '../types';

export function HomeScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const [sites, setSites] = useState<Site[]>([]);
  const [histories, setHistories] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const horizontalPadding = width >= 700 ? 32 : 20;
  const contentWidth = Math.min(width - horizontalPadding * 2, 720);
  const chartWidth = Math.max(contentWidth - 60, 200);

  const loadSites = useCallback(async () => {
    try {
      setError(null);
      const nextSites = await getSites();
      const tdsEntries = await Promise.all(
        nextSites.map(async (site) => [site.id, await getSiteHistory(site.id, 'tds')] as const),
      );
      setSites(nextSites);
      setHistories(Object.fromEntries(tdsEntries));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Water data could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSites();
  }, [loadSites]);

  const counts = useMemo(
    () => ({
      safe: sites.filter((site) => site.status === 'safe').length,
      attention: sites.filter((site) => site.status !== 'safe').length,
    }),
    [sites],
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.brand} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: horizontalPadding, width: '100%', maxWidth: 784 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.brand}
            colors={[theme.brand]}
            onRefresh={() => {
              setRefreshing(true);
              void loadSites();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: theme.brand }]}>CAMPUS WATER INTELLIGENCE</Text>
          <Text style={[styles.title, { color: theme.text }]}>Every drop, in view.</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Live quality readings from drinking-water points across campus.
          </Text>
        </View>

        <View style={[styles.summary, { backgroundColor: theme.sunken }]}>
          <View>
            <Text style={[styles.summaryNumber, { color: theme.text }]}>{sites.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.muted }]}>sites online</Text>
          </View>
          <View style={[styles.summaryRule, { backgroundColor: theme.border }]} />
          <View>
            <Text style={[styles.summaryNumber, { color: '#3FA796' }]}>{counts.safe}</Text>
            <Text style={[styles.summaryLabel, { color: theme.muted }]}>safe</Text>
          </View>
          <View style={[styles.summaryRule, { backgroundColor: theme.border }]} />
          <View>
            <Text style={[styles.summaryNumber, { color: '#C98A3B' }]}>{counts.attention}</Text>
            <Text style={[styles.summaryLabel, { color: theme.muted }]}>need attention</Text>
          </View>
        </View>

        {error ? (
          <View style={[styles.error, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Monitoring sites</Text>
          <Text style={[styles.updated, { color: theme.faint }]}>Updated just now</Text>
        </View>

        <View style={styles.list}>
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              tdsHistory={histories[site.id] ?? []}
              chartWidth={chartWidth}
              onPress={() => navigation.navigate('SiteDetail', { siteId: site.id })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignSelf: 'center', paddingTop: 24, paddingBottom: 36 },
  intro: { gap: 8, marginBottom: 22 },
  eyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1.4 },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 41 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, maxWidth: 520 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 28,
  },
  summaryNumber: { fontFamily: fonts.mono, fontSize: 20, textAlign: 'center' },
  summaryLabel: { fontFamily: fonts.body, fontSize: 11, textAlign: 'center', marginTop: 2 },
  summaryRule: { width: StyleSheet.hairlineWidth, height: 32 },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 18 },
  updated: { fontFamily: fonts.body, fontSize: 12 },
  list: { gap: 16 },
  error: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 18 },
  errorText: { fontFamily: fonts.body, fontSize: 14 },
});

