import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/src/theme';
import { getProfile, isUnlocked } from '@/src/store';

export default function Index() {
  const router = useRouter();
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (!p) {
        router.replace('/onboarding');
      } else if (!isUnlocked()) {
        router.replace('/unlock');
      } else {
        router.replace('/(tabs)/dashboard');
      }
      setBusy(false);
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }}>
      <ActivityIndicator color={theme.colors.brandPrimary} />
    </View>
  );
}
