import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface JournalBoxProps {
  title?: string;
  subtitle?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
  style?: ViewStyle;
  numberOfLines?: number;
}

export const JournalBox: React.FC<JournalBoxProps> = ({
  title,
  subtitle,
  value,
  onChangeText,
  placeholder,
  minHeight = 80,
  style,
  numberOfLines = 3,
}) => {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Write here...'}
        placeholderTextColor={THEME.colors.textLight}
        multiline
        numberOfLines={numberOfLines}
        style={[styles.input, { minHeight }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 14,
    marginBottom: 14,
    ...THEME.shadow,
  },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  input: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textDark,
    fontFamily: THEME.typography.fontFamilySans,
    textAlignVertical: 'top',
  },
});
