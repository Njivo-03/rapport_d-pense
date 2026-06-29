import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { colors, spacing } from '../theme';

export default function AppCard({ children, style, contentStyle }) {
  return (
    <Card mode="elevated" style={[styles.card, style]}>
      <Card.Content style={[styles.content, contentStyle]}>{children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  content: {
    padding: spacing.lg,
  },
});
