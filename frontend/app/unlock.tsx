import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { getProfile, hashPassword, markUnlocked, Profile, resetAllData } from '@/src/store';

export default function Unlock() {
  const router = useRouter();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (!p) router.replace('/onboarding');
      else setProfileState(p);
    })();
  }, []);

  const onUnlock = async () => {
    if (!profile) return;
    setError('');
    if (!password) { setError('Enter your password'); return; }
    setLoading(true);
    try {
      const hash = await hashPassword(password, profile.salt);
      if (hash !== profile.password_hash) {
        setError('Wrong password');
      } else {
        markUnlocked();
        router.replace('/(tabs)/dashboard');
      }
    } finally { setLoading(false); }
  };

  const onReset = async () => {
    await resetAllData();
    router.replace('/onboarding');
  };

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {profile.logo ? (
            <Image source={{ uri: profile.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.logoInitial}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name} testID="unlock-name">{profile.name}</Text>
          <Text style={styles.subtitle}>Enter your password to unlock</Text>

          <View style={{ marginTop: theme.spacing.xl, width: '100%' }}>
            <Field label="" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry testID="unlock-password-input" />
            {!!error && <Text style={styles.error} testID="unlock-error">{error}</Text>}
            <Button title="Unlock" onPress={onUnlock} loading={loading} testID="unlock-submit-button" />
          </View>

          {!showReset ? (
            <Pressable onPress={() => setShowReset(true)} style={styles.forgot} testID="unlock-forgot-button">
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          ) : (
            <View style={styles.resetBox} testID="unlock-reset-box">
              <Feather name="alert-triangle" size={18} color={theme.colors.warning} />
              <Text style={styles.resetTitle}>Reset the app</Text>
              <Text style={styles.resetText}>
                For your safety, the app {"can't"} recover your password. Resetting deletes ALL local data (materials, products, appliances) and returns you to the setup screen.
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Button title="Cancel" variant="ghost" onPress={() => setShowReset(false)} testID="unlock-reset-cancel" />
                </View>
                <View style={{ flex: 1 }}>
                  <Pressable style={styles.destroyBtn} onPress={onReset} testID="unlock-reset-confirm">
                    <Text style={styles.destroyText}>Reset app</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  container: { padding: theme.spacing.xl, paddingTop: theme.spacing.xxxl, alignItems: 'center', flexGrow: 1 },
  logo: { width: 88, height: 88, borderRadius: 44 },
  logoFallback: { backgroundColor: theme.colors.brandTertiary, alignItems: 'center', justifyContent: 'center' },
  logoInitial: { fontSize: 36, fontWeight: '700', color: theme.colors.onBrandTertiary },
  name: { fontSize: 22, fontWeight: '700', color: theme.colors.onSurface, marginTop: theme.spacing.md },
  subtitle: { fontSize: 13, color: theme.colors.muted, marginTop: 4 },
  error: { color: theme.colors.error, marginBottom: theme.spacing.md, fontSize: 13 },
  forgot: { marginTop: theme.spacing.xl, padding: 10 },
  forgotText: { color: theme.colors.muted, fontSize: 13 },
  resetBox: {
    marginTop: theme.spacing.xl, width: '100%',
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1, borderColor: theme.colors.warning,
    borderRadius: theme.radius.md, padding: theme.spacing.lg,
  },
  resetTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.onSurface, marginTop: 6 },
  resetText: { fontSize: 12, color: theme.colors.muted, marginTop: 6, lineHeight: 18 },
  destroyBtn: {
    minHeight: 52, borderRadius: theme.radius.md, backgroundColor: theme.colors.error,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.xl,
  },
  destroyText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
