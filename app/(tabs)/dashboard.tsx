import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme, fmtMoney } from '@/src/theme';
import { getProfile, listMaterials, listProducts, listAppliances, computeProductCost, Profile } from '@/src/store';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState({ materials_count: 0, products_count: 0, avg_margin_percent: 0, total_est_revenue: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, mats, apps, prods] = await Promise.all([getProfile(), listMaterials(), listAppliances(), listProducts()]);
    setProfile(p);
    let avg = 0;
    let rev = 0;
    if (prods.length > 0) {
      const margins = prods.map((x) => x.desired_margin_percent || 0);
      avg = Math.round((margins.reduce((s, v) => s + v, 0) / margins.length) * 10) / 10;
      for (const prod of prods) {
        const c = computeProductCost(prod, mats, apps);
        rev += c.selling_price;
      }
    }
    setSummary({
      materials_count: mats.length,
      products_count: prods.length,
      avg_margin_percent: avg,
      total_est_revenue: Math.round(rev * 100) / 100,
    });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const firstName = profile?.name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandPrimary} />}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello} testID="dashboard-greeting">Hi {firstName} 👋</Text>
            <Text style={styles.subhead}>{"Here's your workshop today"}</Text>
          </View>
          {profile?.logo ? (
            <Image source={{ uri: profile.logo }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{(profile?.name?.[0] || 'U').toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.hero} testID="dashboard-hero-margin">
          <Text style={styles.heroLabel}>Avg. profit margin</Text>
          <Text style={styles.heroValue}>{summary.avg_margin_percent}%</Text>
          <Text style={styles.heroCaption}>Across {summary.products_count} product{summary.products_count === 1 ? '' : 's'}</Text>
        </View>

        <View style={styles.grid}>
          <Pressable style={styles.card} onPress={() => router.push('/(tabs)/materials')} testID="dashboard-card-materials">
            <Feather name="package" size={20} color={theme.colors.brandPrimary} />
            <Text style={styles.cardVal}>{summary.materials_count}</Text>
            <Text style={styles.cardLabel}>Raw materials</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={() => router.push('/(tabs)/products')} testID="dashboard-card-products">
            <Feather name="box" size={20} color={theme.colors.brandSecondary} />
            <Text style={styles.cardVal}>{summary.products_count}</Text>
            <Text style={styles.cardLabel}>Products</Text>
          </Pressable>
        </View>

        <View style={styles.revCard} testID="dashboard-revenue-card">
          <Feather name="trending-up" size={22} color={theme.colors.success} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.revLabel}>Est. revenue / unit sold</Text>
            <Text style={styles.revValue}>{fmtMoney(summary.total_est_revenue)}</Text>
          </View>
        </View>

        <Text style={styles.section}>Quick actions</Text>
        <View style={{ gap: theme.spacing.md }}>
          <Pressable style={styles.action} onPress={() => router.push('/material/new')} testID="dashboard-add-material">
            <Feather name="plus-circle" size={20} color={theme.colors.brandPrimary} />
            <Text style={styles.actionText}>Add raw material</Text>
            <Feather name="chevron-right" size={20} color={theme.colors.muted} />
          </Pressable>
          <Pressable style={styles.action} onPress={() => router.push('/product/new')} testID="dashboard-add-product">
            <Feather name="plus-circle" size={20} color={theme.colors.brandSecondary} />
            <Text style={styles.actionText}>Build a new product</Text>
            <Feather name="chevron-right" size={20} color={theme.colors.muted} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  container: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  hello: { fontSize: 26, fontWeight: '700', color: theme.colors.onSurface },
  subhead: { fontSize: 14, color: theme.colors.muted, marginTop: 4 },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.brandTertiary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '700', color: theme.colors.onBrandTertiary },
  hero: { backgroundColor: theme.colors.surfaceInverse, borderRadius: theme.radius.lg, padding: theme.spacing.xl, marginTop: theme.spacing.xl },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  heroValue: { color: theme.colors.onSurfaceInverse, fontSize: 44, fontWeight: '700', marginTop: 4 },
  heroCaption: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 6 },
  grid: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg },
  card: { flex: 1, backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg },
  cardVal: { fontSize: 28, fontWeight: '700', color: theme.colors.onSurface, marginTop: 10 },
  cardLabel: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
  revCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.brandTertiary, borderRadius: theme.radius.md, padding: theme.spacing.lg, marginTop: theme.spacing.md },
  revLabel: { fontSize: 12, color: theme.colors.onBrandTertiary, opacity: 0.7 },
  revValue: { fontSize: 20, fontWeight: '700', color: theme.colors.onBrandTertiary, marginTop: 2 },
  section: { marginTop: theme.spacing.xl, fontSize: 16, fontWeight: '600', color: theme.colors.onSurface, marginBottom: theme.spacing.md },
  action: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg, gap: theme.spacing.md },
  actionText: { flex: 1, fontSize: 15, color: theme.colors.onSurface, fontWeight: '500' },
});
