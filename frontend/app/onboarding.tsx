import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/src/theme';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { setProfile, hashPassword, newSalt, markUnlocked } from '@/src/store';

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<string | undefined>(undefined); // data URI
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickLogo = async () => {
    setError('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('We need photo library access to pick a logo. You can also skip this step.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets && res.assets[0]?.base64) {
      const a = res.assets[0];
      const mime = a.mimeType || 'image/jpeg';
      setLogo(`data:${mime};base64,${a.base64}`);
    }
  };

  const onSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Business name is required'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const salt = newSalt();
      const hash = await hashPassword(password, salt);
      await setProfile({
        name: name.trim(),
        logo,
        password_hash: hash,
        salt,
        created_at: new Date().toISOString(),
      });
      markUnlocked();
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      setError(e.message || 'Setup failed');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>MARGINMASTER</Text>
          <Text style={styles.title}>Set up your workshop</Text>
          <Text style={styles.subtitle}>Everything stays on this device. No account, no cloud.</Text>

          <Pressable style={styles.logoPicker} onPress={pickLogo} testID="onboarding-logo-picker">
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoImg} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Feather name="image" size={26} color={theme.colors.muted} />
                <Text style={styles.logoText}>Add logo (optional)</Text>
              </View>
            )}
          </Pressable>

          <View style={{ marginTop: theme.spacing.xl }}>
            <Field label="Business / your name" value={name} onChangeText={setName} placeholder="e.g. Priya's Bakery" autoCapitalize="words" testID="onboarding-name-input" />
            <Field label="App password" value={password} onChangeText={setPassword} placeholder="At least 4 characters" secureTextEntry testID="onboarding-password-input" helper="You'll enter this every time you open the app." />
            <Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Repeat password" secureTextEntry testID="onboarding-confirm-input" />
            {!!error && <Text style={styles.error} testID="onboarding-error">{error}</Text>}
            <Button title="Enter my workshop" onPress={onSubmit} loading={loading} testID="onboarding-submit-button" />
          </View>

          <View style={styles.privacyBox}>
            <Feather name="lock" size={14} color={theme.colors.brandPrimary} />
            <Text style={styles.privacyText}>Your data is encrypted on this device only. Forgetting the password wipes the app.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  container: { padding: theme.spacing.xl, paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xxxl, flexGrow: 1 },
  brand: { fontSize: 12, color: theme.colors.brandPrimary, fontWeight: '700', letterSpacing: 2 },
  title: { fontSize: 30, fontWeight: '700', color: theme.colors.onSurface, marginTop: theme.spacing.md },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: 6 },
  logoPicker: {
    marginTop: theme.spacing.xl, alignSelf: 'center',
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSecondary,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  logoImg: { width: '100%', height: '100%' },
  logoPlaceholder: { alignItems: 'center' },
  logoText: { color: theme.colors.muted, fontSize: 11, marginTop: 6 },
  error: { color: theme.colors.error, marginBottom: theme.spacing.md, fontSize: 13 },
  privacyBox: {
    marginTop: theme.spacing.xl,
    flexDirection: 'row', gap: 8,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.brandTertiary,
    borderRadius: theme.radius.md,
  },
  privacyText: { color: theme.colors.onBrandTertiary, fontSize: 12, flex: 1, lineHeight: 18 },
});
