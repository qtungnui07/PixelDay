import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function IndexScreen() {
  const { isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: theme.colors.background, flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return <Redirect href="/home" />;
}
