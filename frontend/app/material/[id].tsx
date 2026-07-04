import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme, fmtMoney } from '@/src/theme';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { createMaterial, deleteMaterial, getMaterial, updateMaterial, Unit } from '@/src/store';

const UNITS: Unit[] = ['g', 'kg', 'ml', 'L', 'piece', 'inch', 'cm', 'm'];

export default function MaterialEdit() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const isNew = !params.id || params.id === 'new';

  const [name, setName] = useState('');
  const [bulkCost, setBulkCost] = useState('');
  const [bulkQty, setBulkQty] = useState('');
  const [unit, setUnit] = useState<Unit>('g');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew && params.id) {
      (async () => {
        const m = await getMaterial(String(params.id));
        if (m) { setName(m.name); setBulkCost(String(m.bulk_cost)); setBulkQty(String(m.bulk_quantity)); setUnit(m.unit); }
      })();
    }
  }, [params.id]);

  const cost = parseFloat(bulkCost) || 0;
  const qty = parseFloat(bulkQty) || 0;
  const perUnit = qty > 0 ? cost / qty : 0;

  const onSave = async () => {
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (qty <= 0) { setError('Bulk quantity must be greater than 0'); return; }
    if (cost < 0) { setError('Bulk cost cannot be negative'); return; }
    setLoading(true);
    try {
      const payload = { name: name.trim(), bulk_cost: cost, bulk_quantity: qty, unit };
      if (isNew) await createMaterial(payload);
      else await updateMaterial(String(params.id), payload);
      router.back();
    } catch (e: any) { setError(e.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  const onDelete = async () => {
    if (isNew) return;
    await deleteMaterial(String(params.id));
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.hb} testID="material-back">
          <Feather name="chevron-left" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>{isNew ? 'New material' : 'Edit material'}</Text>
        <View style={{ width: 32 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.previewCard} testID="material-preview-card">
            <Text style={styles.previewLabel}>Per-unit cost</Text>
            <Text style={styles.previewValue}>{fmtMoney(perUnit)} <Text style={styles.previewUnit}>/ {unit}</Text></Text>
            <Text style={styles.previewCaption}>Auto-calculated from bulk cost ÷ bulk quantity</Text>
          </View>

          <Field label="Material name" value={name} onChangeText={setName} placeholder="e.g. Flour, Wax, Fabric" testID="material-name-input" />
          <Field label="Bulk cost" value={bulkCost} onChangeText={setBulkCost} placeholder="e.g. 250" keyboardType="numeric" suffix="₹" testID="material-cost-input" />
          <Field label="Bulk quantity" value={bulkQty} onChangeText={setBulkQty} placeholder="e.g. 5" keyboardType="numeric" testID="material-qty-input" />

          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitsWrap}>
            {UNITS.map((u) => (
              <Pressable key={u} onPress={() => setUnit(u)} style={[styles.chip, unit === u && styles.chipOn]} testID={`material-unit-${u}`}>
                <Text style={[styles.chipText, unit === u && styles.chipTextOn]}>{u}</Text>
              </Pressable>
            ))}
          </View>

          {!!error && <Text style={styles.error} testID="material-error">{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          {!isNew && (
            <Pressable onPress={onDelete} style={styles.delBtn} testID="material-delete-button">
              <Feather name="trash-2" size={18} color={theme.colors.error} />
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            <Button title={isNew ? 'Save material' : 'Update material'} onPress={onSave} loading={loading} testID="material-save-button" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md },
  hb: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.onSurface },
  container: { padding: theme.spacing.xl, paddingBottom: 120 },
  previewCard: { backgroundColor: theme.colors.surfaceInverse, borderRadius: theme.radius.lg, padding: theme.spacing.xl, marginBottom: theme.spacing.xl },
  previewLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  previewValue: { color: theme.colors.onSurfaceInverse, fontSize: 32, fontWeight: '700', marginTop: 6 },
  previewUnit: { fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  previewCaption: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 6 },
  label: { fontSize: 13, color: theme.colors.onSurfaceTertiary, marginBottom: 8, fontWeight: '500' },
  unitsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSecondary },
  chipOn: { backgroundColor: theme.colors.brandPrimary, borderColor: theme.colors.brandPrimary },
  chipText: { color: theme.colors.onSurface, fontSize: 13, fontWeight: '500' },
  chipTextOn: { color: theme.colors.onBrandPrimary },
  error: { color: theme.colors.error, marginTop: theme.spacing.md, fontSize: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surfaceSecondary },
  delBtn: { width: 52, height: 52, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.error, alignItems: 'center', justifyContent: 'center' },
});
