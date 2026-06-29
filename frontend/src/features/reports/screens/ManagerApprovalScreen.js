import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import AppInput from '../../../components/AppInput';
import ExpenseItem from '../../../components/ExpenseItem';
import PrimaryButton from '../../../components/PrimaryButton';
import SecondaryButton from '../../../components/SecondaryButton';
import StatusBadge from '../../../components/StatusBadge';
import {
  approveReport,
  fetchReportById,
  reimburseReport,
  rejectReport,
} from '../../../services/reportservice.js';
import { colors, spacing } from '../../../theme';

export default function ManagerApprovalScreen({ navigation, route }) {
  const reportId = route.params?.reportId;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // 'approve' | 'reject' | 'reimburse'
  const [comment, setComment] = useState('');
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

  // ─── Action générique ──────────────────────────────────────────────────────
  const performAction = useCallback(
    async (actionKey, actionFn, successMessage, confirmTitle, confirmMessage) => {
      Alert.alert(confirmTitle, confirmMessage, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: actionKey === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionLoading(actionKey);
              await actionFn();
              Alert.alert('Succès', successMessage, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              Alert.alert('Erreur', err.message || "L'action a échoué.");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]);
    },
    [navigation]
  );

  // ─── Approuver ─────────────────────────────────────────────────────────────
  const handleApprove = useCallback(() => {
    performAction(
      'approve',
      () => approveReport(reportId, comment.trim() || undefined),
      'Le rapport a été approuvé.',
      'Approuver le rapport',
      'Voulez-vous approuver ce rapport ?'
    );
  }, [reportId, comment, performAction]);

  // ─── Refuser ───────────────────────────────────────────────────────────────
  const handleReject = useCallback(() => {
    performAction(
      'reject',
      () => rejectReport(reportId, comment.trim() || undefined),
      'Le rapport a été refusé.',
      'Refuser le rapport',
      'Voulez-vous refuser ce rapport ?'
    );
  }, [reportId, comment, performAction]);

  // ─── Rembourser ────────────────────────────────────────────────────────────
  const handleReimburse = useCallback(() => {
    performAction(
      'reimburse',
      () => reimburseReport(reportId),
      'Le rapport a été marqué comme remboursé.',
      'Rembourser le rapport',
      'Confirmer le remboursement de ce rapport ?'
    );
  }, [reportId, performAction]);

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

  const isSubmitted = report.status === 'submitted';
  const isApproved = report.status === 'approved';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.subtitle}>Validation par le responsable</Text>
          {report.employee && (
            <Text style={styles.employeeName}>
              Employé : {report.employee.name}
            </Text>
          )}
        </View>
        <StatusBadge status={report.status} />
      </View>

      {/* Résumé */}
      <AppCard contentStyle={styles.summary}>
        <View style={styles.row}>
          <Text style={styles.label}>Période</Text>
          <Text style={styles.value}>{report.period || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dépenses</Text>
          <Text style={styles.value}>{report.expenseCount || 0} dépense(s)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>{report.amount}</Text>
        </View>
        {report.managerComment && (
          <View style={styles.previousComment}>
            <Text style={styles.previousCommentLabel}>Commentaire précédent :</Text>
            <Text style={styles.previousCommentText}>{report.managerComment}</Text>
          </View>
        )}
      </AppCard>

      {/* Dépenses */}
      <AppCard>
        <Text style={styles.sectionTitle}>
          Dépenses ({report.expenses?.length || 0})
        </Text>
        {report.expenses?.length > 0 ? (
          report.expenses.map((expense) => (
            <ExpenseItem key={expense.id} {...expense} />
          ))
        ) : (
          <Text style={styles.emptyText}>Aucune dépense.</Text>
        )}
      </AppCard>

      {/* Commentaire du manager */}
      <AppInput
        label="Commentaire (optionnel)"
        multiline
        numberOfLines={4}
        placeholder="Ajouter un commentaire..."
        value={comment}
        onChangeText={setComment}
      />

      {/* Boutons d'action — selon le statut */}
      {isSubmitted && (
        <View style={styles.actions}>
          <PrimaryButton
            icon="check"
            style={styles.actionButton}
            onPress={handleApprove}
            loading={actionLoading === 'approve'}
            disabled={!!actionLoading}
          >
            Approuver
          </PrimaryButton>
          <SecondaryButton
            icon="close"
            textColor={colors.error}
            style={styles.actionButton}
            onPress={handleReject}
            loading={actionLoading === 'reject'}
            disabled={!!actionLoading}
          >
            Refuser
          </SecondaryButton>
        </View>
      )}

      {isApproved && (
        <PrimaryButton
          icon="cash-refund"
          style={[styles.actionButton, styles.reimburseButton]}
          onPress={handleReimburse}
          loading={actionLoading === 'reimburse'}
          disabled={!!actionLoading}
        >
          {actionLoading === 'reimburse' ? 'Traitement...' : 'Rembourser'}
        </PrimaryButton>
      )}

      {!isSubmitted && !isApproved && (
        <AppCard contentStyle={styles.infoBox}>
          <Text style={styles.infoText}>
            Ce rapport est actuellement en statut «{' '}
            {report.status} » et ne peut pas être modifié.
          </Text>
        </AppCard>
      )}
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
  employeeName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  summary: {
    gap: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  total: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  previousComment: {
    backgroundColor: colors.muted,
    borderRadius: 8,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  previousCommentLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  previousCommentText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  reimburseButton: {
    backgroundColor: colors.info,
  },
  infoBox: {
    backgroundColor: colors.muted,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});