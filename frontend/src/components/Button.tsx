import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: any;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, testID, style }: Props) {
  const isDisabled = disabled || loading;
  const bg =
    variant === 'primary' ? theme.colors.brandPrimary :
    variant === 'secondary' ? theme.colors.brandSecondary :
    'transparent';
  const color =
    variant === 'primary' || variant === 'secondary' ? theme.colors.onBrandPrimary :
    theme.colors.brandPrimary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.colors.border },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={color} /> : (
        <Text style={[styles.text, { color }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  text: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
});
