import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme, fmtMoney } from '@/src/theme';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { listMaterials, listAppliances, createAppliance, createProduct, Material, Appliance, BomMaterial, ApplianceUsage } from '@/src/store';

export default function NewProduct() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [bomMats, setBomMats] = useState<BomMaterial[]>([]);
  const [apUses, setApUses] = useState<ApplianceUsage[]>([]);
  const [laborHours, setLaborHours] = useState('');
  const [laborRate, setLaborRate] = useState('');
  const [packaging, setPackaging] = useState('');
  const [margin, setMargin] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newApName, setNewApName] = useState('');
  const [newApWatt, setNewApWatt] = useState('');

  useEffect(() => {
    (async () => {
      const [m, a] = await Promise.all([listMaterials(), listAppliances()]);
      setMaterials(m); setAppliances(a);
    })();
  }, []);

  const preview = useMemo(() => {
    let matCost = 0;
    bomMats.forEach((bm) => {
      const m = materials.find((x) => x.id === bm.material_id);
      if (m && m.bulk_quantity) matCost += (m.bulk_cost / m.bulk_quantity) * (bm.quantity || 0);
    });
    let elec = 0;
    apUses.forEach((au) => {
      const a = appliances.find((x) => x.id === au.appliance_id);
      if (a) elec += ((a.wattage * (au.hours || 0)) / 1000) * (au.cost_per_kwh || 0);
    });
    const labor = (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0);
    const pack = parseFloat(packaging) || 0;
    const totalCost = matCost + elec + labor + pack;
    const m = Math.min(99, parseFloat(margin) || 0);
    const price = m > 0 ? totalCost / (1 - m / 100) : totalCost;
    return { totalCost, price };
  }, [bomMats, apUses, laborHours, laborRate, packaging, margin, materials, appliances]);

  const toggleMaterial = (id: string) => {
    setBomMats((cur) => cur.find((c) => c.material_id === id) ? cur.filter((c) => c.material_id !== id) : [...cur, { material_id: id, quantity: 0 }]);
  };
  const setMatQty = (id: string, q: string) => {
    const n = parseFloat(q) || 0;
    setBomMats((cur) => cur.map((c) => c.material_id === id ? { ...c, quantity: n } : c));
  };

  const toggleAppliance = (id: string) => {
    setApUses((cur) => cur.find((c) => c.appliance_id === id) ? cur.filter((c) => c.appliance_id !== id) : [...cur, { appliance_id: id, hours: 0, cost_per_kwh: 8 }]);
  };
  const setApField = (id: string, field: 'hours' | 'cost_per_kwh', v: string) => {
    const n = parseFloat(v) || 0;
    setApUses((cur) => cur.map((c) => c.appliance_id === id ? { ...c, [field]: n } : c));
  };

  const addAppliance = async () => {
    if (!newApName.trim() || !newApWatt.trim()) return;
    try {
      const a = await createAppliance({ name: newApName.trim(), wattage: parseFloat(newApWatt) || 0 });
      setAppliances((cur) => [a, ...cur]);
      setNewApName(''); setNewApWatt('');
    } catch (e: any) { setError(e.message); }
  };

  const onSave = async () => {
    setError('');
    if (!name.trim()) { setError('Product name is required'); return; }
    setLoading(true);
    try {
      const created = await createProduct({
        name: name.trim(),
        materials: bomMats.filter((b) => b.quantity > 0),
        appliances: apUses.filter((a) => a.hours > 0),
        labor_hours: parseFloat(laborHours) || 0,
        labor_rate: parseFloat(laborRate) || 0,
        packaging_cost: parseFloat(packaging) || 0,
        overhead_percent: 0,
        desired_margin_percent: parseFloat(margin) || 0,
      });
      router.replace(`/product/${created.id}`);
    } catch (e: any) { setError(e.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.hb} testID="product-back">
          <Feather name="chevron-left" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Build product</Text>
        <View style={{ width: 32 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.previewCard} testID="product-preview-card">
            <Text style={styles.pLabel}>Live selling price</Text>
            <Text style={styles.pValue}>{fmtMoney(preview.price)}</Text>
            <Text style={styles.pCaption}>Total cost {fmtMoney(preview.totalCost)}</Text>
          </View>

          <Field label="Product name" value={name} onChangeText={setName} placeholder="e.g. Chocolate Cake" autoCapitalize="words" testID="product-name-input" />

          <SectionHeader icon="package" title="Materials" />
          {materials.length === 0 ? (
            <EmptyRow text="No materials yet. Add some in the Materials tab." />
          ) : materials.map((m) => {
            const sel = bomMats.find((b) => b.material_id === m.id);
            const per = m.bulk_quantity > 0 ? m.bulk_cost / m.bulk_quantity : 0;
            return (
              <View key={m.id} style={styles.item} testID={`product-material-${m.id}`}>
                <Pressable style={styles.itemHead} onPress={() => toggleMaterial(m.id)}>
                  <Feather name={sel ? 'check-square' : 'square'} size={18} color={sel ? theme.colors.brandPrimary : theme.colors.muted} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.itemName}>{m.name}</Text>
                    <Text style={styles.itemSub}>{fmtMoney(per)} / {m.unit}</Text>
                  </View>
                </Pressable>
                {sel && (
                  <View style={styles.qtyRow}>
                    <Text style={styles.qtyLabel}>Quantity used ({m.unit})</Text>
                    <Field label="" value={String(sel.quantity || '')} onChangeText={(v) => setMatQty(m.id, v)} keyboardType="numeric" placeholder="0" testID={`product-material-qty-${m.id}`} />
                  </View>
                )}
              </View>
            );
          })}

          <SectionHeader icon="zap" title="Electricity (appliances)" />
          <View style={styles.subCard}>
            <Text style={styles.subLabel}>Add appliance</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 2 }}>
                <Field label="" value={newApName} onChangeText={setNewApName} placeholder="e.g. Oven" testID="product-new-appliance-name" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="" value={newApWatt} onChangeText={setNewApWatt} placeholder="Watt" keyboardType="numeric" testID="product-new-appliance-watt" />
              </View>
            </View>
            <Button title="+ Add appliance" variant="ghost" onPress={addAppliance} testID="product-add-appliance-button" />
          </View>

          {appliances.map((a) => {
            const sel = apUses.find((u) => u.appliance_id === a.id);
            return (
              <View key={a.id} style={styles.item} testID={`product-appliance-${a.id}`}>
                <Pressable style={styles.itemHead} onPress={() => toggleAppliance(a.id)}>
                  <Feather name={sel ? 'check-square' : 'square'} size={18} color={sel ? theme.colors.brandPrimary : theme.colors.muted} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.itemName}>{a.name}</Text>
                    <Text style={styles.itemSub}>{a.wattage} W</Text>
                  </View>
                </Pressable>
                {sel && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Field label="Hours used" value={String(sel.hours || '')} onChangeText={(v) => setApField(a.id, 'hours', v)} keyboardType="numeric" placeholder="0" testID={`product-appliance-hours-${a.id}`} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field label="Cost/kWh (₹)" value={String(sel.cost_per_kwh || '')} onChangeText={(v) => setApField(a.id, 'cost_per_kwh', v)} keyboardType="numeric" placeholder="8" testID={`product-appliance-kwh-${a.id}`} />
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <SectionHeader icon="user" title="Labor" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><Field label="Hours" value={laborHours} onChangeText={setLaborHours} keyboardType="numeric" placeholder="0" testID="product-labor-hours" /></View>
            <View style={{ flex: 1 }}><Field label="Rate/hour" value={laborRate} onChangeText={setLaborRate} keyboardType="numeric" placeholder="0" suffix="₹" testID="product-labor-rate" /></View>
          </View>

          <SectionHeader icon="gift" title="Packaging & overhead" />
          <Field label="Packaging cost (flat)" value={packaging} onChangeText={setPackaging} keyboardType="numeric" placeholder="0" suffix="₹" testID="product-packaging" />

          <SectionHeader icon="percent" title="Profit margin" />
          <Field label="Desired margin %" value={margin} onChangeText={setMargin} keyboardType="numeric" placeholder="30" suffix="%" helper="Margin as % of selling price" testID="product-margin" />

          {!!error && <Text style={styles.error} testID="product-error">{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Save & view breakdown" onPress={onSave} loading={loading} testID="product-save-button" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const SectionHeader = ({ icon, title }: { icon: any; title: string }) => (
  <View style={styles.section}>
    <Feather name={icon} size={16} color={theme.colors.brandPrimary} />
    <Text style={styles.sectionText}>{title}</Text>
  </View>
);

const EmptyRow = ({ text }: { text: string }) => (
  <View style={styles.emptyRow}><Text style={styles.emptyText}>{text}</Text></View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md },
  hb: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.onSurface },
  container: { padding: theme.spacing.xl, paddingBottom: 140 },
  previewCard: { backgroundColor: theme.colors.surfaceInverse, borderRadius: theme.radius.lg, padding: theme.spacing.xl, marginBottom: theme.spacing.xl },
  pLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  pValue: { color: theme.colors.onSurfaceInverse, fontSize: 34, fontWeight: '700', marginTop: 4 },
  pCaption: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
  sectionText: { fontSize: 15, fontWeight: '700', color: theme.colors.onSurface },
  item: { backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: 8 },
  itemHead: { flexDirection: 'row', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: theme.colors.onSurface },
  itemSub: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  qtyRow: { marginTop: 8 },
  qtyLabel: { fontSize: 12, color: theme.colors.muted, marginBottom: 4 },
  subCard: { backgroundColor: theme.colors.surfaceTertiary, borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: 12 },
  subLabel: { fontSize: 12, color: theme.colors.muted, marginBottom: 6 },
  emptyRow: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceTertiary },
  emptyText: { color: theme.colors.muted, fontSize: 13 },
  error: { color: theme.colors.error, marginTop: theme.spacing.md, fontSize: 13 },
  footer: { padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surfaceSecondary },
});
