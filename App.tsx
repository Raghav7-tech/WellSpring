import { Ionicons } from '@expo/vector-icons';
import {
  Fraunces_600SemiBold,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import {
  IBMPlexMono_500Medium,
  useFonts as usePlexMono,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  useFonts as usePlexSans,
} from '@expo-google-fonts/ibm-plex-sans';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AlertsScreen } from './screens/AlertsScreen';
import { AssistantScreen } from './screens/AssistantScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SiteDetailScreen } from './screens/SiteDetailScreen';
import { fonts, useAppTheme } from './theme/tokens';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'water-outline',
  Assistant: 'chatbubble-ellipses-outline',
  Alerts: 'notifications-outline',
};

function MainTabs() {
  const theme = useAppTheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.faint,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 12 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Assistant" component={AssistantScreen} />
      <Tabs.Screen name="Alerts" component={AlertsScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  const theme = useAppTheme();
  const navigationTheme: Theme = {
    dark: theme.isDark,
    colors: {
      primary: theme.brand,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: '#BD4B3C',
    },
    fonts: {
      regular: { fontFamily: fonts.body, fontWeight: '400' },
      medium: { fontFamily: fonts.bodyMedium, fontWeight: '500' },
      bold: { fontFamily: fonts.bodySemiBold, fontWeight: '600' },
      heavy: { fontFamily: fonts.display, fontWeight: '600' },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="SiteDetail"
          component={SiteDetailScreen}
          options={{
            title: 'Site details',
            headerBackTitle: 'Sites',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerTitleStyle: { fontFamily: fonts.bodySemiBold },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold });
  const [plexLoaded] = usePlexSans({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });
  const [monoLoaded] = usePlexMono({ IBMPlexMono_500Medium });

  if (!frauncesLoaded || !plexLoaded || !monoLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#0E7C74" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8F6',
  },
});
