// src/features/expenses/screens/ExpensesListScreen.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FAB, Modal, Portal, Searchbar, Text, TouchableRipple } from 'react-native-paper';
import AppCard from '../../../components/AppCard';
import AppInput from '../../../components/AppInput';
import ExpenseItem from '../../../components/ExpenseItem';
import PrimaryButton from '../../../components/PrimaryButton';
import SecondaryButton from '../../../components/SecondaryButton';
import { routes } from '../../../navigation/routes';
import { colors, spacing } from '../../../theme';
import { useExpenses } from '../contexts/ExpensesContext';

// ─── Catégories alignées sur les enums Prisma ─────────────────────────────────
// ✅ Plus de dépendance à mockData
const CATEGORY_TABS = [
  { label: 'Toutes',          value: 'Toutes' },
  { label: 'Restaurant',      value: 'RESTAURANT' },
  { label: 'Transport',       value: 'TRANSPORT' },
  { label: 'Fournitures',     value: 'OFFICE_SUPPLIES' },
  { label: 'Hôtel',           value: 'HOTEL' },
  { label: 'Carburant',       value: 'FUEL' },
  { label: 'Autre',           value: 'OTHER' },
];

const initialFilters = {
  minAmount:     '',
  maxAmount:     '',
  paymentMethod: 'Tous',
  project:       'Tous',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(amount) {
  return Number(String(amount).replace(/[^\d]/g, ''));
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function uniqueValues(expenses, key) {
  return ['Tous', ...Array.from(new Set(expenses.map((e) => e[key]).filter(Boolean)))];
}

// ─── FilterOption ─────────────────────────────────────────────────────────────

function FilterOption({ active, label, onPress }) {
  return (
    <TouchableRipple borderless onPress={onPress} style={[styles.filterChip, active && styles.activeFilterChip]}>
      <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>{label}</Text>
    </TouchableRipple>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function ExpensesListScreen({ navigation }) {
  const { expenses, loading, fetchExpenses } = useExpenses();

  const [query,         setQuery]         = useState('');
  const [category,      setCategory]      = useState('Toutes');
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftFilters,  setDraftFilters]  = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  // ✅ Recharge les dépenses à chaque fois que l'écran devient visible
  // (notamment après un ajout depuis AddExpenseScreen)
  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [fetchExpenses])
  );

  const paymentMethods = useMemo(() => uniqueValues(expenses, 'paymentMethod'), [expenses]);
  const projects       = useMemo(() => uniqueValues(expenses, 'project'),       [expenses]);

  const activeFilterCount = useMemo(
    () => Object.entries(appliedFilters).filter(([k, v]) => v !== initialFilters[k]).length,
    [appliedFilters]
  );

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const search    = normalize(query);
      const amount    = parseAmount(expense.amount);
      const minAmount = parseAmount(appliedFilters.minAmount);
      const maxAmount = parseAmount(appliedFilters.maxAmount);

      const matchesSearch =
        !search ||
        normalize(expense.description).includes(search)   ||
        normalize(expense.category).includes(search)      ||
        normalize(expense.project).includes(search)       ||
        normalize(expense.mission).includes(search)       ||
        normalize(expense.paymentMethod).includes(search);

      const matchesCategory  = category === 'Toutes' || expense.category === category;
      const matchesMinAmount = !appliedFilters.minAmount || amount >= minAmount;
      const matchesMaxAmount = !appliedFilters.maxAmount || amount <= maxAmount;
      const matchesPayment   = appliedFilters.paymentMethod === 'Tous' || expense.paymentMethod === appliedFilters.paymentMethod;
      const matchesProject   = appliedFilters.project === 'Tous' || expense.project === appliedFilters.project;

      return matchesSearch && matchesCategory && matchesMinAmount && matchesMaxAmount && matchesPayment && matchesProject;
    });
  }, [appliedFilters, category, expenses, query]);

  const openFilters  = () => { setDraftFilters(appliedFilters); setFilterVisible(true); };
  const applyFilters = () => { setAppliedFilters(draftFilters); setFilterVisible(false); };
  const resetFilters = () => { setDraftFilters(initialFilters); setAppliedFilters(initialFilters); setFilterVisible(false); };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Mes Dépenses</Text>
          <Text style={styles.subtitle}>Toutes vos dépenses enregistrées</Text>
        </View>

        {/* Barre de recherche + bouton filtre */}
        <View style={styles.searchRow}>
          <Searchbar
            iconColor={colors.textSecondary}
            inputStyle={styles.searchInput}
            onChangeText={setQuery}
            placeholder="Rechercher une dépense"
            placeholderTextColor={colors.textSecondary}
            style={styles.search}
            value={query}
          />
          <TouchableRipple borderless onPress={openFilters} style={styles.filterButton}>
            <View>
              <MaterialCommunityIcons name="tune-variant" color={colors.textPrimary} size={22} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
          </TouchableRipple>
        </View>

        {/* Onglets catégories — ✅ depuis CATEGORY_TABS, plus mockData */}
        <ScrollView horizontal contentContainerStyle={styles.tabs} showsHorizontalScrollIndicator={false}>
          {CATEGORY_TABS.map((item) => {
            const active = item.value === category;
            return (
              <TouchableRipple
                borderless key={item.value}
                onPress={() => setCategory(item.value)}
                style={[styles.tab, active && styles.activeTab]}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>{item.label}</Text>
              </TouchableRipple>
            );
          })}
        </ScrollView>

        {/* Résultats */}
        {(query || category !== 'Toutes' || activeFilterCount > 0) && (
          <View style={styles.resultRow}>
            <Text style={styles.resultText}>
              {filteredExpenses.length} résultat{filteredExpenses.length > 1 ? 's' : ''}
            </Text>
            {(query || activeFilterCount > 0) && (
              <TouchableRipple borderless onPress={() => { setQuery(''); resetFilters(); }} style={styles.clearInlineButton}>
                <Text style={styles.clearInlineText}>Réinitialiser</Text>
              </TouchableRipple>
            )}
          </View>
        )}

        {/* Liste */}
        <AppCard contentStyle={styles.listContent}>
          {loading && expenses.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          )}

          {!loading && filteredExpenses.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="receipt-text-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucune dépense trouvée</Text>
              <Text style={styles.emptyText}>
                {query || activeFilterCount > 0
                  ? 'Modifiez la recherche ou les filtres.'
                  : 'Appuyez sur + pour ajouter votre première dépense.'}
              </Text>
            </View>
          )}

          {filteredExpenses.map((expense) => (
            <TouchableRipple
              key={expense.id}
              onPress={() => navigation.navigate(routes.EXPENSE_DETAIL, { expenseId: expense.id })}
            >
              <ExpenseItem {...expense} />
            </TouchableRipple>
          ))}
        </AppCard>
      </ScrollView>

      <FAB
        color={colors.textPrimary}
        icon="plus"
        onPress={() => navigation.navigate(routes.ADD_EXPENSE)}
        style={styles.fab}
      />

      {/* Modal filtres */}
      <Portal>
        <Modal contentContainerStyle={styles.modal} onDismiss={() => setFilterVisible(false)} visible={filterVisible}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrer les dépenses</Text>
            <TouchableRipple borderless onPress={() => setFilterVisible(false)} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" color={colors.textPrimary} size={22} />
            </TouchableRipple>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Montant</Text>
            <View style={styles.amountRow}>
              <AppInput
                keyboardType="numeric" label="Minimum"
                onChangeText={(v) => setDraftFilters((c) => ({ ...c, minAmount: v }))}
                value={draftFilters.minAmount}
              />
              <AppInput
                keyboardType="numeric" label="Maximum"
                onChangeText={(v) => setDraftFilters((c) => ({ ...c, maxAmount: v }))}
                value={draftFilters.maxAmount}
              />
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Moyen de paiement</Text>
            <ScrollView horizontal contentContainerStyle={styles.filterChips} showsHorizontalScrollIndicator={false}>
              {paymentMethods.map((item) => (
                <FilterOption
                  active={draftFilters.paymentMethod === item} key={item} label={item}
                  onPress={() => setDraftFilters((c) => ({ ...c, paymentMethod: item }))}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Projet / Mission</Text>
            <ScrollView horizontal contentContainerStyle={styles.filterChips} showsHorizontalScrollIndicator={false}>
              {projects.map((item) => (
                <FilterOption
                  active={draftFilters.project === item} key={item} label={item}
                  onPress={() => setDraftFilters((c) => ({ ...c, project: item }))}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.modalActions}>
            <SecondaryButton icon="refresh" onPress={resetFilters} style={styles.modalAction}>Réinitialiser</SecondaryButton>
            <PrimaryButton   icon="check"   onPress={applyFilters} style={styles.modalAction}>Appliquer</PrimaryButton>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:       { backgroundColor: colors.background, flex: 1 },
  container:    { gap: spacing.lg, padding: spacing.lg, paddingBottom: 96 },
  header:       { paddingTop: spacing.md },
  title:        { color: colors.textPrimary, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  subtitle:     { color: colors.textSecondary, fontSize: 13, marginTop: 2, textAlign: 'center' },
  searchRow:    { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  search:       { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 12, borderWidth: 1, elevation: 0, flex: 1, height: 46 },
  searchInput:  { color: colors.textPrimary, fontSize: 13, minHeight: 46 },
  filterButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 12, borderWidth: 1, height: 46, justifyContent: 'center', width: 46 },
  filterBadge:  { alignItems: 'center', backgroundColor: colors.error, borderRadius: 8, height: 16, justifyContent: 'center', position: 'absolute', right: -8, top: -8, width: 16 },
  filterBadgeText: { color: colors.white, fontSize: 10, fontWeight: '900' },
  tabs:         { gap: spacing.sm, paddingRight: spacing.lg },
  tab:          { backgroundColor: colors.muted, borderRadius: 999, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  activeTab:    { backgroundColor: colors.primary },
  tabText:      { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
  activeTabText:{ color: colors.textPrimary },
  resultRow:    { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.sm },
  resultText:   { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  clearInlineButton: { borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  clearInlineText:   { color: colors.primary, fontSize: 12, fontWeight: '900' },
  listContent:  { paddingBottom: 0, paddingTop: spacing.sm },
  emptyState:   { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyTitle:   { color: colors.textPrimary, fontSize: 15, fontWeight: '800' },
  emptyText:    { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
  fab:          { backgroundColor: colors.primary, borderRadius: 18, bottom: 24, position: 'absolute', right: 24 },
  modal:        { backgroundColor: colors.white, borderRadius: 12, gap: spacing.lg, margin: spacing.lg, padding: spacing.lg },
  modalHeader:  { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  modalTitle:   { color: colors.textPrimary, fontSize: 18, fontWeight: '900' },
  closeButton:  { alignItems: 'center', borderRadius: 10, height: 36, justifyContent: 'center', width: 36 },
  filterSection:{ gap: spacing.sm },
  filterLabel:  { color: colors.textPrimary, fontSize: 13, fontWeight: '900' },
  amountRow:    { flexDirection: 'row', gap: spacing.sm },
  filterChips:  { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip:   { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  activeFilterChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText:   { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
  activeFilterChipText: { color: colors.textPrimary },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalAction:  { flex: 1 },
});