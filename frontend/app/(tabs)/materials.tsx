import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme, fmtMoney } from '@/src/theme';
import { listMaterials, Material } from '@/src/store';

export default function Materials() {
  const router = useRouter();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setItems(await listMaterials());
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Materials</Text>
          <Text style={styles.sub}>Your raw material inventory</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/material/new')} testID="materials-add-button">
          <Feather name="plus" size={22} color={theme.colors.onBrandPrimary} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.brandPrimary} />
      ) : items.length === 0 ? (
        <View style={styles.empty} testID="materials-empty-state">
          <Feather name="package" size={44} color={theme.colors.muted} />
          <Text style={styles.emptyTitle}>No materials yet</Text>
          <Text style={styles.emptyText}>Add flour, sugar, wood, wax or any raw input you buy in bulk.</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push('/material/new')} testID="materials-empty-add-button">
            <Text style={styles.emptyBtnText}>+ Add your first material</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: 0, paddingBottom: theme.spacing.xxxl }}
          data={items}
          keyExtractor={(it) => it.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandPrimary} />}
          renderItem={({ item }) => {
            const per = item.bulk_quantity > 0 ? item.bulk_cost / item.bulk_quantity : 0;
            return (
              <Pressable style={styles.row} onPress={() => router.push(`/material/${item.id}`)} testID={`material-row-${item.id}`}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}><Feather name="package" size={18} color={theme.colors.brandPrimary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    <Text style={styles.rowSub}>Bulk: {fmtMoney(item.bulk_cost)} for {item.bulk_quantity} {item.unit}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.unitCost}>{fmtMoney(per)}</Text>
                  <Text style={styles.unitCaption}>per {item.unit}</Text>
                </View>
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  header: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h1: { fontSize: 28, fontWeight: '700', color: theme.colors.onSurface },
  sub: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.brandPrimary, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.onSurface, marginTop: 12 },
  emptyText: { fontSize: 14, color: theme.colors.muted, textAlign: 'center', marginTop: 6 },
  emptyBtn: { marginTop: theme.spacing.xl, backgroundColor: theme.colors.brandPrimary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: theme.radius.md },
  emptyBtnText: { color: theme.colors.onBrandPrimary, fontWeight: '600' },
  row: { backgroundColor: theme.colors.surfaceSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.brandTertiary, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  rowSub: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  unitCost: { fontSize: 15, fontWeight: '700', color: theme.colors.brandPrimary },
  unitCaption: { fontSize: 11, color: theme.colors.muted, marginTop: 2 },
});
