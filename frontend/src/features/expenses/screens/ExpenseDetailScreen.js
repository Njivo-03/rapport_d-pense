// src/features/expenses/screens/ExpenseDetailScreen.js
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Snackbar, Text } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import PrimaryButton from '../../../components/PrimaryButton';
import SecondaryButton from '../../../components/SecondaryButton';
import { routes } from '../../../navigation/routes';
import { colors, spacing } from '../../../theme';
import { useExpenses } from '../contexts/ExpensesContext';

// ─── Maps enums → labels lisibles ────────────────────────────────────────────

const CATEGORY_LABELS = {
  RESTAURANT:      { label: 'Restaurant',        icon: 'food-fork-drink',      color: colors.primary },
  TRANSPORT:       { label: 'Transport',          icon: 'car-outline',          color: colors.info },
  OFFICE_SUPPLIES: { label: 'Fourniture bureau',  icon: 'briefcase-outline',    color: colors.warning },
  HOTEL:           { label: 'Hôtel',              icon: 'bed-outline',          color: '#A78BFA' },
  FUEL:            { label: 'Carburant',          icon: 'gas-station-outline',  color: '#F97316' },
  OTHER:           { label: 'Autre',              icon: 'receipt-text-outline', color: colors.textSecondary },
};

const PAYMENT_LABELS = {
  CARD:     { label: 'Carte bancaire', icon: 'credit-card-outline' },
  CASH:     { label: 'Espèces',        icon: 'cash' },
  TRANSFER: { label: 'Mobile Money',   icon: 'cellphone' },
  OTHER:    { label: 'Autre',          icon: 'dots-horizontal' },
};

const STATUS_CONFIG = {
  PENDING:    { label: 'En attente',  color: colors.warning, icon: 'clock-outline' },
  SUBMITTED:  { label: 'Soumis',      color: colors.info,    icon: 'send-outline' },
  APPROVED:   { label: 'Approuvé',    color: colors.success, icon: 'check-circle-outline' },
  REJECTED:   { label: 'Refusé',      color: colors.error,   icon: 'close-circle-outline' },
  REIMBURSED: { label: 'Remboursé',   color: colors.primary, icon: 'cash-refund' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatAmount(amount) {
  if (!amount) return '0 Ar';
  const n = Number(String(amount).replace(/[^\d]/g, ''));
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ar`;
}

// ─── Composant ligne d'info ───────────────────────────────────────────────────

function InfoRow({ label, value, icon }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelRow}>
        {icon && <MaterialCommunityIcons name={icon} size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function ExpenseDetailScreen({ navigation, route }) {
  const { deleteExpense, getExpenseById } = useExpenses();
  const [feedback, setFeedback] = useState({
    message: route.params?.message || '',
    type:    route.params?.messageType || 'success',
  });

  const expense = getExpenseById(route.params?.expenseId);

  useEffect(() => {
    if (route.params?.message) {
      setFeedback({ message: route.params.message, type: route.params.messageType || 'success' });
      navigation.setParams({ message: undefined, messageType: undefined });
    }
  }, [navigation, route.params?.message, route.params?.messageType]);

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer la dépense',
      'Voulez-vous vraiment supprimer cette dépense ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            const result = await deleteExpense(expense.id);
            if (result?.success) {
              setFeedback({ message: 'Dépense supprimée avec succès.', type: 'success' });
              setTimeout(() => navigation.goBack(), 900);
            } else {
              setFeedback({ message: result?.message || 'Erreur lors de la suppression.', type: 'error' });
            }
          },
        },
      ]
    );
  };

  // ── État vide ─────────────────────────────────────────────────────────────
  if (!expense) {
    return (
      <View style={styles.notFound}>
        <MaterialCommunityIcons name="receipt-text-remove-outline" size={56} color={colors.textSecondary} />
        <Text style={styles.notFoundTitle}>Dépense introuvable</Text>
        <Text style={styles.notFoundText}>Elle a peut-être déjà été supprimée.</Text>
        <PrimaryButton icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </PrimaryButton>
      </View>
    );
  }

  // ── Données enrichies depuis les enums ────────────────────────────────────
  const categoryInfo = CATEGORY_LABELS[expense.category]  || CATEGORY_LABELS.OTHER;
  const paymentInfo  = PAYMENT_LABELS[expense.paymentMethod] || PAYMENT_LABELS.OTHER;
  const statusInfo   = STATUS_CONFIG[expense.status] || STATUS_CONFIG.PENDING;

  // ── Détection type de justificatif ────────────────────────────────────────
  const hasAttachment = Boolean(expense.attachmentUrl || expense.attachment);
  const attachmentUrl = expense.attachmentUrl || expense.attachment;
  const isPdf = attachmentUrl?.toLowerCase().includes('.pdf');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── En-tête avec icône catégorie ─────────────────────────────── */}
        <AppCard contentStyle={styles.headerCard}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '22' }]}>
            <MaterialCommunityIcons name={categoryInfo.icon} size={36} color={categoryInfo.color} />
          </View>

          <Text style={styles.description}>{expense.description || '—'}</Text>
          <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
          <Text style={styles.date}>{formatDateDisplay(expense.date)}</Text>

          {/* Statut */}
          <View style={[styles.statusPill, { backgroundColor: statusInfo.color + '22' }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={13} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>

          {/* Catégorie */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{categoryInfo.label}</Text>
          </View>
        </AppCard>

        {/* ── Détails ───────────────────────────────────────────────────── */}
        <AppCard contentStyle={styles.detailCard}>
          <InfoRow
            label="Moyen de paiement"
            value={paymentInfo.label}
            icon={paymentInfo.icon}
          />
          <InfoRow
            label="Projet"
            value={expense.project}
            icon="briefcase-outline"
          />
          <InfoRow
            label="Mission"
            value={expense.mission}
            icon="map-marker-outline"
          />
        </AppCard>

        {/* ── Justificatif ──────────────────────────────────────────────── */}
        {hasAttachment && (
          <AppCard contentStyle={styles.detailCard}>
            <Text style={styles.sectionLabel}>Justificatif</Text>
            <TouchableOpacity
              style={styles.attachment}
              activeOpacity={0.75}
              onPress={() => attachmentUrl && Linking.openURL(attachmentUrl)}
            >
              <View style={styles.attachmentThumb}>
                <MaterialCommunityIcons
                  name={isPdf ? 'file-pdf-box' : 'image'}
                  color={isPdf ? '#C62828' : colors.textPrimary}
                  size={26}
                />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {isPdf ? 'Justificatif PDF' : 'Justificatif image'}
                </Text>
                <Text style={styles.attachmentSub}>Appuyer pour ouvrir</Text>
              </View>
              <MaterialCommunityIcons name="open-in-new" color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </AppCard>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <PrimaryButton
            icon="pencil-outline"
            onPress={() => navigation.navigate(routes.ADD_EXPENSE, { expenseId: expense.id })}
            style={styles.actionButton}
          >
            Modifier
          </PrimaryButton>
          <SecondaryButton
            icon="delete-outline"
            onPress={confirmDelete}
            textColor={colors.error}
            style={styles.actionButton}
          >
            Supprimer
          </SecondaryButton>
        </View>
        {/* ── Ajouter au rapport ────────────────────────────────────────── */}
           <PrimaryButton
              icon="file-plus-outline"
              onPress={() => navigation.navigate(routes.ADD_TO_REPORT, {
                expense: expense,
              })}
              style={{ marginTop: spacing.sm }}
            >
              Ajouter à un rapport
            </PrimaryButton>

      </ScrollView>

      <Snackbar
        duration={3500}
        onDismiss={() => setFeedback({ message: '', type: 'success' })}
        style={[styles.snackbar, feedback.type === 'error' && styles.errorSnackbar]}
        visible={Boolean(feedback.message)}
      >
        {feedback.message}
      </Snackbar>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:        { backgroundColor: colors.background, flex: 1 },
  container:     { backgroundColor: colors.background, gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  headerCard:    { alignItems: 'center', gap: spacing.sm },
  categoryIcon:  { alignItems: 'center', borderRadius: 20, height: 72, justifyContent: 'center', marginBottom: spacing.sm, width: 72 },
  description:   { color: colors.textPrimary, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  amount:        { color: colors.primary, fontSize: 26, fontWeight: '900' },
  date:          { color: colors.textSecondary, fontSize: 13 },
  statusPill:    { alignItems: 'center', borderRadius: 999, flexDirection: 'row', gap: 5, marginTop: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  statusText:    { fontSize: 12, fontWeight: '800' },
  categoryPill:  { backgroundColor: colors.muted, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  categoryText:  { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
  detailCard:    { gap: spacing.md },
  sectionLabel:  { color: colors.textPrimary, fontSize: 13, fontWeight: '900', marginBottom: spacing.xs },
  infoRow:       { borderBottomColor: colors.border, borderBottomWidth: 1, gap: spacing.xs, paddingBottom: spacing.md },
  infoLabelRow:  { alignItems: 'center', flexDirection: 'row' },
  infoLabel:     { color: colors.textSecondary, fontSize: 12 },
  infoValue:     { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  attachment:    { alignItems: 'center', borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.sm },
  attachmentThumb: { alignItems: 'center', backgroundColor: colors.secondary || '#FFF9E6', borderRadius: 10, height: 52, justifyContent: 'center', width: 52 },
  attachmentInfo:  { flex: 1 },
  attachmentName:  { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  attachmentSub:   { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  actions:       { flexDirection: 'row', gap: spacing.md },
  actionButton:  { flex: 1 },
  snackbar:      { backgroundColor: colors.success },
  errorSnackbar: { backgroundColor: colors.error },
  notFound:      { alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: 'center', padding: spacing.xl },
  notFoundTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '900' },
  notFoundText:  { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
});