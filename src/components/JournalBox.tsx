import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, TextInput } from './AppText';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
        },
        style,
      ]}
    >
      {title && (
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textDark,
                fontFamily: theme.typography.fontFamilySerif,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Write here...'}
        placeholderTextColor={theme.colors.textLight}
        multiline
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          {
            minHeight,
            color: theme.colors.textDark,
            fontFamily: theme.typography.fontFamilySans,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  input: {
    fontSize: 14,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
});
