import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { theme } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  testID?: string;
  helper?: string;
  suffix?: string;
};

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, testID, helper, suffix }: Props) {
  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrap}>
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
        {!!suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {!!helper && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.lg },
  label: { fontSize: 13, color: theme.colors.onSurfaceTertiary, marginBottom: 6, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    paddingVertical: 14,
  },
  suffix: { color: theme.colors.muted, fontSize: 14, marginLeft: 6 },
  helper: { fontSize: 12, color: theme.colors.muted, marginTop: 6 },
});
