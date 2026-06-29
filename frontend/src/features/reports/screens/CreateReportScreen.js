// src/features/reports/screens/CreateReportScreen.js
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import AppInput from '../../../components/AppInput';
import PrimaryButton from '../../../components/PrimaryButton';
import { createReport } from '../../../services/reportservice';
import { routes } from '../../../navigation/routes';
import { colors, spacing } from '../../../theme';

export default function CreateReportScreen({ navigation, route }) { // ← ajouter route
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const expenseId = route.params?.expenseId; // ← récupérer expenseId si présent
      const report = await createReport({
        title: title.trim(),
        expenseIds: expenseId ? [expenseId] : [],
      });
      navigation.replace(routes.REPORT_DETAIL, { reportId: report.id });
    } catch (err) {
      setError(err.message || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nouveau rapport</Text>
      <Text style={styles.subtitle}>Donnez un titre à votre rapport de dépenses.</Text>

      <View style={styles.form}>
        <AppInput
          label="Titre du rapport"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Déplacement Paris juin 2026"
          left={<AppInput.Icon icon="file-document-outline" />}
        />
        {error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton
          icon="check"
          loading={loading}
          disabled={loading}
          onPress={handleCreate}
        >
          Créer le rapport
        </PrimaryButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
});