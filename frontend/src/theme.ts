export const theme = {
  colors: {
    surface: '#FCFCFB',
    onSurface: '#1C1C1A',
    surfaceSecondary: '#FFFFFF',
    onSurfaceSecondary: '#1C1C1A',
    surfaceTertiary: '#F2F1EF',
    onSurfaceTertiary: '#4A4A46',
    surfaceInverse: '#1C1C1A',
    onSurfaceInverse: '#FFFFFF',
    brand: '#4C7D64',
    brandPrimary: '#4C7D64',
    onBrandPrimary: '#FFFFFF',
    brandSecondary: '#D88358',
    onBrandSecondary: '#FFFFFF',
    brandTertiary: '#E6EBE8',
    onBrandTertiary: '#2B4738',
    success: '#3E885B',
    warning: '#E5A83B',
    error: '#C95D40',
    border: '#E8E7E5',
    borderStrong: '#C2C1BD',
    divider: '#E8E7E5',
    muted: '#7D7C78',
    pie: {
      materials: '#4C7D64',
      electricity: '#D88358',
      labor: '#E5A83B',
      packaging: '#7D8C83',
      profit: '#2B4738',
    },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
  radius: { sm: 6, md: 12, lg: 20, pill: 999 },
  font: {
    display: 'System',
    text: 'System',
    mono: 'System',
  },
} as const;

export const CURRENCY = '₹';

export const fmtMoney = (n: number | undefined | null): string => {
  const v = typeof n === 'number' ? n : 0;
  return `${CURRENCY}${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};
