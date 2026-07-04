import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { getProfile, lock, resetAllData, listMaterials, listProducts, listAppliances, Profile } from '@/src/store';

export default function ProfileTab() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState<string>('');
  const [showReset, setShowReset] = useState(false);

  const load = useCallback(async () => setProfile(await getProfile()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onLock = () => { lock(); router.replace('/unlock'); };

  const onReset = async () => {
    await resetAllData();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>Profile</Text>

        <View style={styles.card} testID="profile-user-card">
          {profile?.logo ? (
            <Image source={{ uri: profile.logo }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{(profile?.name?.[0] || 'U').toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{profile?.name || '—'}</Text>
            <Text style={styles.since}>On this device since {profile ? new Date(profile.created_at).toLocaleDateString() : '—'}</Text>
          </View>
        </View>

        <View style={styles.privacyRow}>
          <Feather name="wifi-off" size={16} color={theme.colors.brandPrimary} />
          <Text style={styles.privacyText}>Offline-first · No account · No cloud</Text>
        </View>

        <Text style={styles.section}>Manage</Text>
        <Pressable style={styles.link} onPress={() => router.push('/appliances')} testID="profile-link-appliances">
          <Feather name="zap" size={18} color={theme.colors.brandPrimary} />
          <Text style={styles.linkText}>Appliance library</Text>
          <Feather name="chevron-right" size={18} color={theme.colors.muted} />
        </Pressable>

        <Text style={styles.section}>Security</Text>
        <Pressable style={styles.link} onPress={onLock} testID="profile-lock-button">
          <Feather name="lock" size={18} color={theme.colors.brandPrimary} />
          <Text style={styles.linkText}>Lock app</Text>
          <Feather name="chevron-right" size={18} color={theme.colors.muted} />
        </Pressable>

        {!showReset ? (
          <Pressable style={styles.resetLink} onPress={() => setShowReset(true)} testID="profile-reset-button">
            <Feather name="trash-2" size={18} color={theme.colors.error} />
            <Text style={styles.resetText}>Reset app data…</Text>
          </Pressable>
        ) : (
          <View style={styles.resetBox} testID="profile-reset-box">
            <Feather name="alert-triangle" size={18} color={theme.colors.warning} />
            <Text style={styles.resetTitle}>Wipe all data?</Text>
            <Text style={styles.resetInfo}>This will delete all materials, products, appliances, your logo and password. This cannot be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Pressable style={styles.cancelBtn} onPress={() => setShowReset(false)} testID="profile-reset-cancel">
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable style={styles.confirmBtn} onPress={onReset} testID="profile-reset-confirm">
                  <Text style={styles.confirmText}>Yes, wipe</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  container: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
  h1: { fontSize: 28, fontWeight: '700', color: theme.colors.onSurface, marginBottom: theme.spacing.lg },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  avatarFallback: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.brandTertiary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: theme.colors.onBrandTertiary },
  name: { fontSize: 17, fontWeight: '700', color: theme.colors.onSurface },
  since: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  privacyRow: { marginTop: theme.spacing.md, flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, backgroundColor: theme.colors.brandTertiary, borderRadius: theme.radius.md },
  privacyText: { color: theme.colors.onBrandTertiary, fontSize: 12, fontWeight: '600' },
  section: { marginTop: theme.spacing.xl, fontSize: 13, fontWeight: '600', color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: theme.spacing.sm },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg, marginBottom: theme.spacing.sm },
  linkText: { flex: 1, fontSize: 15, color: theme.colors.onSurface, fontWeight: '500' },

  resetLink: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginTop: theme.spacing.sm },
  resetText: { color: theme.colors.error, fontSize: 14, fontWeight: '600' },
  resetBox: { marginTop: theme.spacing.md, backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.warning, borderRadius: theme.radius.md, padding: theme.spacing.lg },
  resetTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.onSurface, marginTop: 6 },
  resetInfo: { fontSize: 12, color: theme.colors.muted, marginTop: 6, lineHeight: 18 },
  cancelBtn: { minHeight: 46, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: theme.colors.onSurface, fontWeight: '600', fontSize: 14 },
  confirmBtn: { minHeight: 46, borderRadius: theme.radius.md, backgroundColor: theme.colors.error, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
