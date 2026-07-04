import React from 'react';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

type Slice = { label: string; value: number; color: string };

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function PieChart({ data, size = 220 }: { data: Slice[]; size?: number }) {
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0);
  const r = size / 2;
  const cx = r;
  const cy = r;

  if (total <= 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r - 2} fill={theme.colors.surfaceTertiary} />
        </Svg>
        <Text style={{ color: theme.colors.muted, marginTop: 8 }}>No data yet</Text>
      </View>
    );
  }

  let start = -Math.PI / 2;
  const paths: React.ReactNode[] = [];
  data.forEach((d, i) => {
    const v = Math.max(0, d.value);
    if (v <= 0) return;
    const angle = (v / total) * Math.PI * 2;
    const end = start + angle;
    // If a single slice is 100%, draw full circle
    if (v / total >= 0.9999) {
      paths.push(
        <Circle key={i} cx={cx} cy={cy} r={r - 2} fill={d.color} />
      );
    } else {
      paths.push(
        <Path key={i} d={arcPath(cx, cy, r - 2, start, end)} fill={d.color} />
      );
    }
    start = end;
  });

  return (
    <Svg width={size} height={size}>
      <G>{paths}</G>
      <Circle cx={cx} cy={cy} r={r * 0.42} fill={theme.colors.surfaceSecondary} />
    </Svg>
  );
}

export function PieLegend({ data, formatValue }: { data: Slice[]; formatValue?: (v: number) => string }) {
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0);
  return (
    <View style={styles.legend}>
      {data.map((d, i) => {
        const pct = total > 0 ? (Math.max(0, d.value) / total) * 100 : 0;
        return (
          <View key={i} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={styles.label}>{d.label}</Text>
            <Text style={styles.pct}>{pct.toFixed(1)}%</Text>
            <Text style={styles.val}>{formatValue ? formatValue(d.value) : d.value.toFixed(2)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  label: { flex: 1, color: theme.colors.onSurface, fontSize: 14 },
  pct: { color: theme.colors.muted, fontSize: 13, marginRight: 12, minWidth: 52, textAlign: 'right' },
  val: { color: theme.colors.onSurface, fontSize: 14, fontWeight: '600', minWidth: 80, textAlign: 'right' },
});
