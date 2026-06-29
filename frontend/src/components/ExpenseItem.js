import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { colors, spacing } from '../theme';

export default function ExpenseItem({ title, date, category, amount, icon = 'receipt' }) {
  return (
    <View style={styles.container}>
      <Avatar.Icon size={42} icon={icon} color={colors.primary} style={styles.avatar} />
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{date}</Text>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={styles.meta}>{category}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    backgroundColor: `${colors.primary}18`,
  },
  details: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  trailing: {
    alignItems: 'flex-end',
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
