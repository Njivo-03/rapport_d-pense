import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Checkbox, Divider, IconButton, Snackbar, Text } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import AppInput from '../../../components/AppInput';
import PrimaryButton from '../../../components/PrimaryButton';
import SecondaryButton from '../../../components/SecondaryButton';
import { routes } from '../../../navigation/routes';
import { login } from '../../../services/authService';
import { colors, spacing } from '../../../theme';

export default function LoginScreen({ navigation }) {
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigation.replace(routes.APP);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const onSubmit = (values) => {
    setErrorMessage('');
    loginMutation.mutate({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>ER</Text>
          </View>
          <Text style={styles.appName}>Expense Report</Text>
          <Text style={styles.tagline}>Gestion professionnelle des notes de frais</Text>
        </View>

        <AppCard style={styles.card}>
          <View style={styles.illustrationWrap}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
              }}
              style={styles.illustration}
            />
            <View style={styles.receiptBadge}>
              <IconButton icon="receipt-text" iconColor={colors.textPrimary} size={28} />
            </View>
          </View>

          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>Connectez-vous pour gerer vos depenses.</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email requis',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Email invalide',
                },
              }}
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={Boolean(errors.email)}
                  keyboardType="email-address"
                  label="Email"
                  left={<AppInput.Icon icon="email-outline" />}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="jean.rakoto@entreprise.com"
                  value={value}
                />
              )}
            />
            {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Mot de passe requis',
                minLength: {
                  value: 8,
                  message: '8 caracteres minimum',
                },
              }}
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  error={Boolean(errors.password)}
                  label="Mot de passe"
                  left={<AppInput.Icon icon="lock-outline" />}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  right={
                    <AppInput.Icon
                      icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                      onPress={() => setPasswordVisible((current) => !current)}
                    />
                  }
                  secureTextEntry={!passwordVisible}
                  value={value}
                />
              )}
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

            <View style={styles.optionsRow}>
              <Checkbox.Item
                label="Se souvenir de moi"
                mode="android"
                onPress={() => setRememberMe((current) => !current)}
                position="leading"
                status={rememberMe ? 'checked' : 'unchecked'}
                style={styles.checkbox}
                labelStyle={styles.checkboxLabel}
                color={colors.primary}
              />
              <Text style={styles.forgot}>Mot de passe oublie ?</Text>
            </View>

            <PrimaryButton
              disabled={loginMutation.isPending}
              icon="login"
              loading={loginMutation.isPending}
              onPress={handleSubmit(onSubmit)}
            >
              Se connecter
            </PrimaryButton>
          </View>

          <View style={styles.dividerRow}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>ou continuer avec</Text>
            <Divider style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <SecondaryButton icon="google" style={styles.socialButton}>
              Google
            </SecondaryButton>
            <SecondaryButton icon="microsoft" style={styles.socialButton}>
              Microsoft
            </SecondaryButton>
          </View>
        </AppCard>
      </ScrollView>

      <Snackbar
        onDismiss={() => setErrorMessage('')}
        style={styles.snackbar}
        visible={Boolean(errorMessage)}
      >
        {errorMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 58,
  },
  logoText: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '900',
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
  },
  illustrationWrap: {
    alignSelf: 'center',
    height: 118,
    marginBottom: spacing.lg,
    width: 160,
  },
  illustration: {
    borderRadius: 18,
    height: '100%',
    width: '100%',
  },
  receiptBadge: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 18,
    bottom: -12,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: -12,
    width: 48,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  fieldError: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
    marginTop: -spacing.xs,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkbox: {
    marginLeft: -spacing.md,
    paddingHorizontal: 0,
  },
  checkboxLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  forgot: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  divider: {
    backgroundColor: colors.border,
    flex: 1,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  socialButton: {
    flex: 1,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});
