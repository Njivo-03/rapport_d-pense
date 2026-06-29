import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import AppCard from './AppCard';
import StatusBadge from './StatusBadge';
import { colors, spacing } from '../theme';

export default function ReportItem({ title, date, amount, status }) {
  return (
    <AppCard contentStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <StatusBadge status={status} />
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
});
