import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { colors } from '../theme';

const badgeColors = {
  draft: colors.textSecondary,
  submitted: colors.info,
  approved: colors.success,
  rejected: colors.error,
  reimbursed: colors.primary,
};

export default function StatusBadge({ status, label }) {
  const badgeColor = badgeColors[status] || colors.textSecondary;

  return (
    <Chip
      compact
      textStyle={[styles.text, { color: badgeColor }]}
      style={[styles.badge, { backgroundColor: `${badgeColor}18` }]}
    >
      {label || status}
    </Chip>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
