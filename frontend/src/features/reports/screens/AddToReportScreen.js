// src/features/reports/screens/AddToReportScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableRipple } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import PrimaryButton from '../../../components/PrimaryButton';
import SecondaryButton from '../../../components/SecondaryButton';
import { routes } from '../../../navigation/routes';
import { fetchReports, updateReport } from '../../../services/reportservice';
import { colors, spacing } from '../../../theme';

export default function AddToReportScreen({ navigation, route }) {
  const { expense } = route.params;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attaching, setAttaching] = useState(false);
  const [error, setError] = useState(null);

  // ─── Charger les rapports DRAFT ───────────────────────────────────────────
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchReports({ status: 'draft' });
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les rapports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  // ─── Attacher la dépense au rapport choisi ────────────────────────────────
  const handleAttach = useCallback(async (report) => {
    try {
      setAttaching(true);
      const currentIds = (report.expenses || []).map((e) => e.id);
      if (currentIds.includes(expense.id)) {
        navigation.replace(routes.REPORT_DETAIL, { reportId: report.id });
        return;
      }
      await updateReport(report.id, {
        expenseIds: [...currentIds, expense.id],
      });
      navigation.replace(routes.REPORT_DETAIL, { reportId: report.id });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout.');
      setAttaching(false);
    }
  }, [expense, navigation]);

  // ─── Créer un nouveau rapport avec cette dépense ──────────────────────────
  const handleCreateNew = useCallback(() => {
    navigation.navigate(routes.CREATE_REPORT, { expenseId: expense.id });
  }, [expense, navigation]);

  if (loading || attaching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>
          {attaching ? 'Ajout en cours...' : 'Chargement...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* ── Résumé de la dépense ─────────────────────────────────────── */}
      <AppCard contentStyle={styles.expenseCard}>
        <Text style={styles.sectionTitle}>Dépense à ajouter</Text>
        <View style={styles.expenseRow}>
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={32}
            color={colors.primary}
          />
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseDesc}>
              {expense.description || '—'}
            </Text>
            <Text style={styles.expenseAmount}>
              {expense.amount} {expense.currency || 'MGA'}
            </Text>
            <Text style={styles.expenseMeta}>
              {expense.category} · {expense.paymentMethod}
            </Text>
          </View>
        </View>
      </AppCard>

      {/* ── Choisir un rapport existant ──────────────────────────────── */}
      <Text style={styles.label}>Choisir un rapport brouillon</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {reports.length === 0 ? (
        <AppCard contentStyle={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Aucun rapport brouillon disponible.
          </Text>
        </AppCard>
      ) : (
        reports.map((report) => (
          <TouchableRipple
            key={report.id}
            borderless
            onPress={() => handleAttach(report)}
            style={styles.reportItem}
          >
            <View style={styles.reportItemInner}>
              <View style={styles.reportItemLeft}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color={colors.primary}
                />
                <View>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportMeta}>
                    {report.expenseCount} dépense(s) · {report.amount}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableRipple>
        ))
      )}

      {/* ── Créer un nouveau rapport ─────────────────────────────────── */}
      <View style={styles.divider}>
        <Text style={styles.dividerText}>ou</Text>
      </View>

      <PrimaryButton
        icon="plus"
        onPress={handleCreateNew}
      >
        Créer un nouveau rapport
      </PrimaryButton>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  expenseCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  expenseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  expenseInfo: {
    flex: 1,
    gap: 2,
  },
  expenseDesc: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  expenseAmount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  expenseMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  error: {
    color: colors.error,
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  reportItem: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
  },
  reportItemInner: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  reportTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  reportMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  divider: {
    alignItems: 'center',
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});