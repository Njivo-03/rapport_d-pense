import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import AppCard from './AppCard';
import { colors, spacing } from '../theme';

export default function StatisticCard({ label, value, color = colors.primary, icon }) {
  return (
    <AppCard style={styles.card} contentStyle={styles.content}>
      <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
});
