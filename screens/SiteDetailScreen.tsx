import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteDetail'>;

export function SiteDetailScreen(_props: Props) {
  return <View />;
}
