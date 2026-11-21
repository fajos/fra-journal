import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { FloralFlower } from './FloralHeader';

interface QuoteFooterProps {
  quote: string;
  author: string;
}

export const QuoteFooter: React.FC<QuoteFooterProps> = ({ quote, author }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: theme.colors.cardBorder,
          backgroundColor: theme.isDark ? 'rgba(28, 28, 33, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        },
      ]}
    >
      <View style={styles.contentRow}>
        <FloralFlower size={20} opacity={0.6} />
        <Text
          style={[
            styles.quoteText,
            {
              color: theme.colors.textMuted,
              fontFamily: theme.typography.fontFamilySerif,
            },
          ]}
        >
          "{quote}" <Text style={[styles.authorText, { color: theme.colors.textDark }]}>— {author}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 14,
    borderTopWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  quoteText: {
    flex: 1,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  authorText: {
    fontStyle: 'normal',
    fontWeight: '600',
  },
});
