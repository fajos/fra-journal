import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { FloralFlower } from './FloralHeader';

interface QuoteFooterProps {
  quote: string;
  author: string;
}

export const QuoteFooter: React.FC<QuoteFooterProps> = ({ quote, author }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <FloralFlower size={20} opacity={0.6} />
        <Text style={styles.quoteText}>
          "{quote}" <Text style={styles.authorText}>— {author}</Text>
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
    borderTopColor: THEME.colors.cardBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
    fontFamily: THEME.typography.fontFamilySerif,
    fontStyle: 'italic',
    color: THEME.colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
  authorText: {
    fontStyle: 'normal',
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
});
