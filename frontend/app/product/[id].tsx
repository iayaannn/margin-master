import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme, fmtMoney } from '@/src/theme';
import { PieChart, PieLegend } from '@/src/components/PieChart';
import {
  getProduct, deleteProduct, duplicateProduct,
  listMaterials, listAppliances, computeProductCost,
  Product, Material, Appliance, CostBreakdown,
} from '@/src/store';

export default function ProductDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const [prod, setProd] = useState<Product | null>(null);
  const [cost, setCost] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'' | 'duplicate'>('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [p, mats, apps] = await Promise.all([getProduct(String(params.id)), listMaterials(), listAppliances()]);
      if (!p) { setError('Product not found'); return; }
      setProd(p);
      setCost(computeProductCost(p, mats, apps));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [params.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onDelete = async () => {
    await deleteProduct(String(params.id));
    router.back();
  };
  const onDuplicate = async () => {
    setBusy('duplicate');
    try {
      const dup = await duplicateProduct(String(params.id));
      if (dup) router.replace(`/product/${dup.id}`);
    } finally { setBusy(''); }
  };

  if (loading || !prod || !cost) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.brandPrimary} />
      </SafeAreaView>
    );
  }

  const b = cost.breakdown;
  const pieData = [
    { label: 'Materials', value: b.materials, color: theme.colors.pie.materials },
    { label: 'Electricity', value: b.electricity, color: theme.colors.pie.electricity },
    { label: 'Labor', value: b.labor, color: theme.colors.pie.labor },
    { label: 'Packaging', value: b.packaging, color: theme.colors.pie.packaging },
    { label: 'Profit', value: b.profit, color: theme.colors.pie.profit },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.hb} testID="product-detail-back">
          <Feather name="chevron-left" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{prod.name}</Text>
        <View style={{ flexDirection: 'row' }}>
          <Pressable onPress={onDuplicate} style={styles.hb} testID="product-detail-duplicate" disabled={busy === 'duplicate'}>
            {busy === 'duplicate' ? <ActivityIndicator color={theme.colors.brandPrimary} /> : <Feather name="copy" size={20} color={theme.colors.brandPrimary} />}
          </Pressable>
          <Pressable onPress={onDelete} style={styles.hb} testID="product-detail-delete">
            <Feather name="trash-2" size={20} color={theme.colors.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard} testID="product-detail-hero">
          <Text style={styles.heroLabel}>Suggested selling price</Text>
          <Text style={styles.heroPrice}>{fmtMoney(cost.selling_price)}</Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}><Text style={styles.pillText}>Cost {fmtMoney(cost.total_cost)}</Text></View>
            <View style={[styles.pill, { backgroundColor: 'rgba(62,136,91,0.2)' }]}>
              <Text style={[styles.pillText, { color: '#8CE0AC' }]}>+{prod.desired_margin_percent}% margin</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Cost breakdown</Text>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <PieChart data={pieData} size={220} />
          </View>
          <PieLegend data={pieData} formatValue={fmtMoney} />
        </View>

        <View style={styles.infoCard} testID="product-detail-numbers">
          <Row label="Materials" value={fmtMoney(cost.material_cost)} />
          <Row label="Electricity" value={fmtMoney(cost.electricity_cost)} />
          <Row label="Labor" value={fmtMoney(cost.labor_cost)} />
          <Row label="Packaging" value={fmtMoney(cost.packaging_cost_total)} />
          <View style={styles.divider} />
          <Row label="Total cost" value={fmtMoney(cost.total_cost)} bold />
          <Row label="Profit / unit" value={fmtMoney(cost.profit_amount)} bold color={theme.colors.success} />
          <Row label="Sell at" value={fmtMoney(cost.selling_price)} bold color={theme.colors.brandPrimary} />
        </View>

        {!!error && <Text style={styles.error} testID="product-detail-error">{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const Row = ({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && { fontWeight: '700', color: theme.colors.onSurface }]}>{label}</Text>
    <Text style={[styles.rowValue, bold && { fontWeight: '700' }, !!color && { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md },
  hb: { padding: 8 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.onSurface, flex: 1, textAlign: 'center' },
  container: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
  heroCard: { backgroundColor: theme.colors.surfaceInverse, borderRadius: theme.radius.lg, padding: theme.spacing.xl },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  heroPrice: { color: theme.colors.onSurfaceInverse, fontSize: 40, fontWeight: '700', marginTop: 6 },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.pill, backgroundColor: 'rgba(255,255,255,0.12)' },
  pillText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  chartCard: { backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg, marginTop: theme.spacing.lg },
  chartTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.onSurface },
  infoCard: { backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg, marginTop: theme.spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 14, color: theme.colors.muted },
  rowValue: { fontSize: 14, color: theme.colors.onSurface },
  divider: { height: 1, backgroundColor: theme.colors.divider, marginVertical: 6 },
  error: { color: theme.colors.error, marginTop: theme.spacing.md, fontSize: 13 },
});
