import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { listAppliances, createAppliance, updateAppliance, deleteAppliance, Appliance } from '@/src/store';

export default function Appliances() {
  const router = useRouter();
  const [items, setItems] = useState<Appliance[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState('');
  const [watt, setWatt] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => { setItems(await listAppliances()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const reset = () => { setName(''); setWatt(''); setEditingId(null); setError(''); };

  const onSave = async () => {
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    const w = parseFloat(watt) || 0;
    if (w <= 0) { setError('Wattage must be greater than 0'); return; }
    if (editingId) await updateAppliance(editingId, { name: name.trim(), wattage: w });
    else await createAppliance({ name: name.trim(), wattage: w });
    reset();
    await load();
  };

  const onEdit = (it: Appliance) => { setEditingId(it.id); setName(it.name); setWatt(String(it.wattage)); };
  const onDelete = async (id: string) => { await deleteAppliance(id); if (editingId === id) reset(); await load(); };
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.hb} testID="appliances-back">
          <Feather name="chevron-left" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Appliance library</Text>
        <View style={{ width: 32 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandPrimary} />}
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingId ? 'Edit appliance' : 'Add appliance'}</Text>
            <Text style={styles.formCaption}>Save appliances once, reuse them across products.</Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Oven, Mixer, Lathe" testID="appliance-name-input" />
            <Field label="Wattage (W)" value={watt} onChangeText={setWatt} keyboardType="numeric" placeholder="e.g. 2000" testID="appliance-wattage-input" />
            {!!error && <Text style={styles.error} testID="appliance-error">{error}</Text>}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {editingId && (
                <View style={{ flex: 1 }}>
                  <Button title="Cancel" variant="ghost" onPress={reset} testID="appliance-cancel-button" />
                </View>
              )}
              <View style={{ flex: 2 }}>
                <Button title={editingId ? 'Update' : 'Add appliance'} onPress={onSave} testID="appliance-save-button" />
              </View>
            </View>
          </View>

          <Text style={styles.section}>Your appliances ({items.length})</Text>
          {items.length === 0 ? (
            <View style={styles.empty} testID="appliances-empty">
              <Feather name="zap" size={32} color={theme.colors.muted} />
              <Text style={styles.emptyText}>No appliances yet. Add the ones you use — ovens, mixers, sewing machines, etc.</Text>
            </View>
          ) : items.map((it) => (
            <View key={it.id} style={styles.row} testID={`appliance-row-${it.id}`}>
              <View style={styles.iconWrap}><Feather name="zap" size={18} color={theme.colors.brandSecondary} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rowName}>{it.name}</Text>
                <Text style={styles.rowSub}>{it.wattage} W</Text>
              </View>
              <Pressable onPress={() => onEdit(it)} style={styles.rowBtn} testID={`appliance-edit-${it.id}`}>
                <Feather name="edit-2" size={16} color={theme.colors.brandPrimary} />
              </Pressable>
              <Pressable onPress={() => onDelete(it.id)} style={styles.rowBtn} testID={`appliance-delete-${it.id}`}>
                <Feather name="trash-2" size={16} color={theme.colors.error} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md },
  hb: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.onSurface },
  container: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
  formCard: { backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
  formTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.onSurface },
  formCaption: { fontSize: 12, color: theme.colors.muted, marginTop: 4, marginBottom: theme.spacing.md },
  section: { fontSize: 14, fontWeight: '600', color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: theme.spacing.md },
  empty: { padding: theme.spacing.xl, alignItems: 'center', backgroundColor: theme.colors.surfaceTertiary, borderRadius: theme.radius.md },
  emptyText: { color: theme.colors.muted, textAlign: 'center', marginTop: 8, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.brandTertiary, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontSize: 15, fontWeight: '600', color: theme.colors.onSurface },
  rowSub: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  rowBtn: { padding: 10 },
  error: { color: theme.colors.error, fontSize: 12, marginBottom: 8 },
});
