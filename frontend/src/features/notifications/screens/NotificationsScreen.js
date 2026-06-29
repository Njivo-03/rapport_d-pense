import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import { notifications } from '../../../data/mockData';
import { colors, spacing } from '../../../theme';

const typeStyles = {
  success: { color: colors.success, icon: 'check-circle' },
  error: { color: colors.error, icon: 'close-circle' },
  warning: { color: colors.warning, icon: 'bell' },
  primary: { color: colors.primary, icon: 'cash' },
};

export default function NotificationsScreen() {
  const groups = notifications.reduce((acc, item) => {
    acc[item.group] = acc[item.group] ? [...acc[item.group], item] : [item];
    return acc;
  }, {});

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <MaterialCommunityIcons name="cog-outline" color={colors.textPrimary} size={22} />
      </View>

      {Object.entries(groups).map(([group, items]) => (
        <View key={group} style={styles.group}>
          <Text style={styles.groupTitle}>{group}</Text>
          <AppCard contentStyle={styles.cardContent}>
            {items.map((item) => {
              const visual = typeStyles[item.type] || typeStyles.primary;
              return (
                <View key={item.id} style={styles.notification}>
                  <View style={[styles.iconWrap, { backgroundColor: `${visual.color}18` }]}>
                    <MaterialCommunityIcons name={visual.icon} color={visual.color} size={24} />
                  </View>
                  <View style={styles.notificationText}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                </View>
              );
            })}
          </AppCard>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  cardContent: {
    paddingVertical: spacing.sm,
  },
  notification: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  message: {
    color: colors.info,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
