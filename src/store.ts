/**
 * Local-only store for MarginMaster.
 * Materials, appliances, and products live in AsyncStorage.
 * Profile (name, logo, password hash) lives in SecureStore (via storage.secureGet/Set).
 * A short-lived "unlocked" flag lives in an in-memory module var.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { storage } from '@/src/utils/storage';

const KEYS = {
  materials: 'mm.materials',
  appliances: 'mm.appliances',
  products: 'mm.products',
};
const SECURE_KEYS = {
  profile: 'mm.profile',       // { name, logo?, password_hash, salt, created_at }
};

export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'inch' | 'cm' | 'm';

export type Material = {
  id: string;
  name: string;
  bulk_cost: number;
  bulk_quantity: number;
  unit: Unit;
  created_at: string;
  updated_at: string;
};

export type Appliance = {
  id: string;
  name: string;
  wattage: number;
  created_at: string;
};

export type BomMaterial = { material_id: string; quantity: number };
export type ApplianceUsage = { appliance_id: string; hours: number; cost_per_kwh: number };

export type Product = {
  id: string;
  name: string;
  materials: BomMaterial[];
  appliances: ApplianceUsage[];
  labor_hours: number;
  labor_rate: number;
  packaging_cost: number;
  overhead_percent: number;
  desired_margin_percent: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  name: string;
  logo?: string; // base64 data URI
  password_hash: string;
  salt: string;
  created_at: string;
};

// Small uuid replacement (RN-safe)
export function uid(): string {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

// ---------- Hashing ----------
export async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}::${password}`,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}
export function newSalt(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

// ---------- Profile (SecureStore) ----------
export async function getProfile(): Promise<Profile | null> {
  const raw = await storage.secureGet<string>(SECURE_KEYS.profile, '');
  if (!raw) return null;
  try { return JSON.parse(raw) as Profile; } catch { return null; }
}
export async function setProfile(p: Profile): Promise<void> {
  await storage.secureSet(SECURE_KEYS.profile, JSON.stringify(p));
}
export async function clearProfile(): Promise<void> {
  await storage.secureRemove(SECURE_KEYS.profile);
}

// ---------- Session (in-memory) ----------
let unlocked = false;
export function isUnlocked() { return unlocked; }
export function markUnlocked() { unlocked = true; }
export function lock() { unlocked = false; }

// ---------- Generic list helpers ----------
async function readList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw) as T[]; } catch { return []; }
}
async function writeList<T>(key: string, list: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

// ---------- Materials ----------
export async function listMaterials(): Promise<Material[]> {
  const arr = await readList<Material>(KEYS.materials);
  return arr.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
export async function getMaterial(id: string): Promise<Material | null> {
  const arr = await listMaterials();
  return arr.find((m) => m.id === id) || null;
}
export async function createMaterial(data: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
  const now = new Date().toISOString();
  const m: Material = { id: uid(), created_at: now, updated_at: now, ...data };
  const arr = await readList<Material>(KEYS.materials);
  arr.push(m);
  await writeList(KEYS.materials, arr);
  return m;
}
export async function updateMaterial(id: string, data: Partial<Omit<Material, 'id' | 'created_at'>>): Promise<Material | null> {
  const arr = await readList<Material>(KEYS.materials);
  const idx = arr.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  arr[idx] = { ...arr[idx], ...data, updated_at: now };
  await writeList(KEYS.materials, arr);
  return arr[idx];
}
export async function deleteMaterial(id: string): Promise<void> {
  const arr = await readList<Material>(KEYS.materials);
  await writeList(KEYS.materials, arr.filter((m) => m.id !== id));
}

// ---------- Appliances ----------
export async function listAppliances(): Promise<Appliance[]> {
  const arr = await readList<Appliance>(KEYS.appliances);
  return arr.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
export async function createAppliance(data: Omit<Appliance, 'id' | 'created_at'>): Promise<Appliance> {
  const now = new Date().toISOString();
  const a: Appliance = { id: uid(), created_at: now, ...data };
  const arr = await readList<Appliance>(KEYS.appliances);
  arr.push(a);
  await writeList(KEYS.appliances, arr);
  return a;
}
export async function updateAppliance(id: string, data: Partial<Omit<Appliance, 'id' | 'created_at'>>): Promise<Appliance | null> {
  const arr = await readList<Appliance>(KEYS.appliances);
  const idx = arr.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  arr[idx] = { ...arr[idx], ...data };
  await writeList(KEYS.appliances, arr);
  return arr[idx];
}
export async function deleteAppliance(id: string): Promise<void> {
  const arr = await readList<Appliance>(KEYS.appliances);
  await writeList(KEYS.appliances, arr.filter((a) => a.id !== id));
}

// ---------- Products ----------
export async function listProducts(): Promise<Product[]> {
  const arr = await readList<Product>(KEYS.products);
  return arr.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
export async function getProduct(id: string): Promise<Product | null> {
  const arr = await listProducts();
  return arr.find((p) => p.id === id) || null;
}
export async function createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const now = new Date().toISOString();
  const p: Product = { id: uid(), created_at: now, updated_at: now, ...data };
  const arr = await readList<Product>(KEYS.products);
  arr.push(p);
  await writeList(KEYS.products, arr);
  return p;
}
export async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product | null> {
  const arr = await readList<Product>(KEYS.products);
  const idx = arr.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  arr[idx] = { ...arr[idx], ...data, updated_at: now };
  await writeList(KEYS.products, arr);
  return arr[idx];
}
export async function deleteProduct(id: string): Promise<void> {
  const arr = await readList<Product>(KEYS.products);
  await writeList(KEYS.products, arr.filter((p) => p.id !== id));
}
export async function duplicateProduct(id: string): Promise<Product | null> {
  const src = await getProduct(id);
  if (!src) return null;
  const now = new Date().toISOString();
  const dup: Product = {
    ...src,
    id: uid(),
    name: `${src.name} (Copy)`,
    created_at: now,
    updated_at: now,
  };
  const arr = await readList<Product>(KEYS.products);
  arr.push(dup);
  await writeList(KEYS.products, arr);
  return dup;
}

// ---------- Cost engine (local mirror of backend /api/compute) ----------
export type CostBreakdown = {
  material_cost: number;
  electricity_cost: number;
  labor_cost: number;
  packaging_cost_total: number;
  overhead_cost: number;
  total_cost: number;
  profit_amount: number;
  selling_price: number;
  breakdown: { materials: number; electricity: number; labor: number; packaging: number; profit: number };
};

export function computeProductCost(product: Product, materials: Material[], appliances: Appliance[]): CostBreakdown {
  const matMap = new Map(materials.map((m) => [m.id, m]));
  const appMap = new Map(appliances.map((a) => [a.id, a]));

  let material_cost = 0;
  for (const bm of product.materials) {
    const m = matMap.get(bm.material_id);
    if (m && m.bulk_quantity > 0) material_cost += (m.bulk_cost / m.bulk_quantity) * bm.quantity;
  }
  let electricity_cost = 0;
  for (const au of product.appliances) {
    const a = appMap.get(au.appliance_id);
    if (a) electricity_cost += ((a.wattage * au.hours) / 1000) * au.cost_per_kwh;
  }
  const labor_cost = product.labor_hours * product.labor_rate;
  const packaging_cost_total = product.packaging_cost;
  const subtotal = material_cost + electricity_cost + labor_cost + packaging_cost_total;
  const overhead_cost = subtotal * (product.overhead_percent / 100);
  const total_cost = subtotal + overhead_cost;
  const margin = Math.min(99, product.desired_margin_percent || 0);
  const selling_price = margin > 0 ? total_cost / (1 - margin / 100) : total_cost;
  const profit_amount = selling_price - total_cost;

  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    material_cost: r(material_cost),
    electricity_cost: r(electricity_cost),
    labor_cost: r(labor_cost),
    packaging_cost_total: r(packaging_cost_total),
    overhead_cost: r(overhead_cost),
    total_cost: r(total_cost),
    profit_amount: r(profit_amount),
    selling_price: r(selling_price),
    breakdown: {
      materials: r(material_cost),
      electricity: r(electricity_cost),
      labor: r(labor_cost),
      packaging: r(packaging_cost_total + overhead_cost),
      profit: r(profit_amount),
    },
  };
}

// ---------- Reset ----------
export async function resetAllData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(KEYS.materials),
    AsyncStorage.removeItem(KEYS.appliances),
    AsyncStorage.removeItem(KEYS.products),
    clearProfile(),
  ]);
  lock();
}
