import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme, fmtMoney } from '@/src/theme';
import { listProducts, listMaterials, listAppliances, computeProductCost, Product, Material, Appliance } from '@/src/store';

export default function Products() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, m, a] = await Promise.all([listProducts(), listMaterials(), listAppliances()]);
    setItems(p); setMaterials(m); setAppliances(a);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Products</Text>
          <Text style={styles.sub}>Priced products & BOMs</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/product/new')} testID="products-add-button">
          <Feather name="plus" size={22} color={theme.colors.onBrandPrimary} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.brandPrimary} />
      ) : items.length === 0 ? (
        <View style={styles.empty} testID="products-empty-state">
          <Feather name="box" size={44} color={theme.colors.muted} />
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.emptyText}>{"Build your first product from materials you've added and see the exact cost + selling price."}</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push('/product/new')} testID="products-empty-add-button">
            <Text style={styles.emptyBtnText}>+ Build a product</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: 0, paddingBottom: theme.spacing.xxxl }}
          data={items}
          keyExtractor={(it) => it.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brandPrimary} />}
          renderItem={({ item }) => {
            const c = computeProductCost(item, materials, appliances);
            return (
              <Pressable style={styles.row} onPress={() => router.push(`/product/${item.id}`)} testID={`product-row-${item.id}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowSub}>Cost {fmtMoney(c.total_cost)}  •  Margin {item.desired_margin_percent}%</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.price}>{fmtMoney(c.selling_price)}</Text>
                  <Text style={styles.priceCap}>Selling price</Text>
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
  rowTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  rowSub: { fontSize: 12, color: theme.colors.muted, marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: theme.colors.brandPrimary },
  priceCap: { fontSize: 11, color: theme.colors.muted, marginTop: 2 },
});
