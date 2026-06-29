import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Text, TouchableRipple } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import SecondaryButton from '../../../components/SecondaryButton';
import { routes } from '../../../navigation/routes';
import { colors, spacing } from '../../../theme';

const settings = [
  { label: 'Informations personnelles', icon: 'account-outline', value: '' },
  { label: 'Parametres', icon: 'cog-outline', value: '' },
  { label: 'Securite', icon: 'shield-lock-outline', value: '' },
  { label: 'Devise', icon: 'currency-usd', value: 'Ar' },
  { label: 'A propos', icon: 'information-outline', value: '' },
];

export default function ProfileScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <Avatar.Image
          size={78}
          source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Jean RAKOTO</Text>
        <Text style={styles.email}>jean.rakoto@entreprise.com</Text>
      </View>

      <AppCard contentStyle={styles.settingsCard}>
        {settings.map((item) => (
          <TouchableRipple key={item.label} borderless onPress={() => {}}>
            <View style={styles.settingRow}>
              <MaterialCommunityIcons name={item.icon} color={colors.textPrimary} size={22} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              {!!item.value && <Text style={styles.settingValue}>{item.value}</Text>}
              <MaterialCommunityIcons name="chevron-right" color={colors.textSecondary} size={22} />
            </View>
          </TouchableRipple>
        ))}
      </AppCard>

      <SecondaryButton icon="logout" textColor={colors.error} onPress={() => navigation.getParent()?.replace(routes.LOGIN)}>
        Deconnexion
      </SecondaryButton>
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
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: spacing.xl,
  },
  avatar: {
    backgroundColor: colors.secondary,
    marginBottom: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  email: {
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: spacing.xs,
    opacity: 0.78,
  },
  settingsCard: {
    paddingVertical: spacing.sm,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
  },
  settingLabel: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  settingValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
