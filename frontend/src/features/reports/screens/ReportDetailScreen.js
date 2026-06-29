// src/features/reports/screens/ReportDetailScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, Text } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import ExpenseItem from '../../../components/ExpenseItem';
import PrimaryButton from '../../../components/PrimaryButton';
import SecondaryButton from '../../../components/SecondaryButton';
import StatusBadge from '../../../components/StatusBadge';
import { routes } from '../../../navigation/routes';
import { fetchReportById, submitReport } from '../../../services/reportservice';
import { colors, spacing } from '../../../theme';

function SummaryRow({ label, value, highlight }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

export default function ReportDetailScreen({ navigation, route }) {
  const reportId = route.params?.reportId;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ─── Chargement ────────────────────────────────────────────────────────────
  const loadReport = useCallback(async () => {
    if (!reportId) {
      setError('Identifiant du rapport manquant.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReportById(reportId);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger le rapport.');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Recharger quand on revient sur l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReport();
    });
    return unsubscribe;
  }, [navigation, loadReport]);

  // ─── Soumettre ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    Alert.alert(
      'Soumettre le rapport',
      'Voulez-vous soumettre ce rapport pour validation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: async () => {
            try {
              setSubmitting(true);
              await submitReport(reportId);
              Alert.alert('Succès', 'Rapport soumis avec succès.', [
                {
                  text: 'OK',
                 onPress: () => navigation.navigate(routes.APP, {
  screen: routes.REPORTS,
}),
                },
              ]);
            } catch (err) {
              Alert.alert('Erreur', err.message || 'La soumission a échoué.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  }, [reportId, navigation]);

  // ─── Export PDF ────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    Alert.alert('Export PDF', "L'export PDF sera disponible prochainement.");
  }, []);

  // ─── Justificatifs ─────────────────────────────────────────────────────────
  const handleAttachments = useCallback(() => {
    Alert.alert('Justificatifs', 'Écran des justificatifs à implémenter.');
  }, []);

  // ─── FAB : ajouter une dépense au rapport ──────────────────────────────────
  const handleAddExpense = useCallback(() => {
  Alert.alert(
    'Ajouter une dépense',
    'Allez dans la liste des dépenses et utilisez le bouton "Ajouter à un rapport".',
    [
      { text: 'OK' },
      {
        text: 'Voir les dépenses',
        onPress: () => navigation.navigate(routes.APP, {
          screen: routes.EXPENSES,
        }),
      },
    ]
  );
}, [navigation]);

  // ─── Render états ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Rapport introuvable.'}</Text>
      </View>
    );
  }

  const canSubmit = report.status === 'draft' || report.status === 'rejected';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── En-tête ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.subtitle}>Résumé et justificatifs</Text>
          </View>
          <StatusBadge status={report.status} />
        </View>

        {/* ── Résumé ──────────────────────────────────────────────────── */}
        <AppCard contentStyle={styles.summary}>
          <SummaryRow label="Période" value={report.period || '—'} />
          <SummaryRow label="Créé le" value={report.date || '—'} />
          <SummaryRow label="Total" value={report.amount} highlight />
          {report.managerComment ? (
            <View style={styles.commentBox}>
              <Text style={styles.commentLabel}>Commentaire manager :</Text>
              <Text style={styles.commentText}>{report.managerComment}</Text>
            </View>
          ) : null}
        </AppCard>

        {/* ── Dépenses ────────────────────────────────────────────────── */}
        <AppCard>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Dépenses ({report.expenses?.length || 0})
            </Text>
            <Text style={styles.sectionTotal}>{report.amount}</Text>
          </View>
          {report.expenses?.length > 0 ? (
            report.expenses.map((expense) => (
              <ExpenseItem key={expense.id} {...expense} />
            ))
          ) : (
            <Text style={styles.emptyText}>Aucune dépense dans ce rapport.</Text>
          )}
        </AppCard>

        {/* ── Actions secondaires ──────────────────────────────────────── */}
        <View style={styles.actions}>
          <SecondaryButton
            icon="file-pdf-box"
            style={styles.actionButton}
            onPress={handleExportPDF}
          >
            Exporter PDF
          </SecondaryButton>
          <SecondaryButton
            icon="image-multiple-outline"
            style={styles.actionButton}
            onPress={handleAttachments}
          >
            Justificatifs
          </SecondaryButton>
        </View>

        {/* ── Soumettre ───────────────────────────────────────────────── */}
        {canSubmit && (
          <PrimaryButton
            icon="send-outline"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Soumission...' : 'Soumettre le rapport'}
          </PrimaryButton>
        )}
      </ScrollView>

      {/* ── FAB ajouter dépense ─────────────────────────────────────── */}
      {canSubmit && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddExpense}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 100, // espace pour le FAB
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  summary: {
    gap: spacing.md,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  highlight: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  commentBox: {
    backgroundColor: colors.muted,
    borderRadius: 8,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  commentLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  commentText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTotal: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    backgroundColor: colors.primary,
    bottom: 24,
    position: 'absolute',
    right: 24,
  },
});